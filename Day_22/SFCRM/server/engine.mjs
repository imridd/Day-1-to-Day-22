
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import {
  OBJECTS,
  USERS,
  ROLE_PERMISSIONS,
  STAGE_PROBABILITIES,
  WORKFLOWS
} from './model.mjs';

import { seed } from './seed.mjs';

import {
  query,
  withTransaction,
  pingDatabase
} from './database.mjs';

// ==================================================
// CONFIGURATION
// ==================================================

const TABLES = new Set([
  'accounts',
  'contacts',
  'leads',
  'opportunities',
  'cases',
  'tasks'
]);

const stamp = () => new Date().toISOString();

const generateId = (obj) =>
  OBJECTS[obj].prefix +
  randomBytes(8).toString('hex').slice(0, 15).toUpperCase();

const sqlDate = (value) => {
  if (!value) return null;

  return String(value)
    .replace('T', ' ')
    .replace(/Z$/, '')
    .slice(0, 23);
};

const numberValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  return Number(value);
};

const inferTaskType = (id) => {
  if (!id) return null;

  const value = String(id);

  if (value.startsWith('001')) return 'accounts';
  if (value.startsWith('003')) return 'contacts';
  if (value.startsWith('00Q')) return 'leads';
  if (value.startsWith('006')) return 'opportunities';
  if (value.startsWith('500')) return 'cases';

  return null;
};

// ==================================================
// CUSTOM ERROR
// ==================================================

export class CRMError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'CRMError';
    this.status = status;
  }
}

// ==================================================
// DATABASE MAPPING HELPERS
// ==================================================

function fromDatabase(obj, row) {
  if (!row) return null;

  const common = {
    Id: row.id,
    OwnerId: row.owner_id,
    CreatedDate: row.created_date,
    LastModifiedDate: row.last_modified_date
  };

  const mappings = {
    accounts: {
      ...common,
      Name: row.name,
      Industry: row.industry,
      Website: row.website,
      Phone: row.phone,
      AnnualRevenue: numberValue(row.annual_revenue),
      BillingCity: row.billing_city
    },

    contacts: {
      ...common,
      AccountId: row.account_id,
      FirstName: row.first_name,
      LastName: row.last_name,
      Email: row.email,
      Phone: row.phone,
      Title: row.title
    },

    leads: {
      ...common,
      FirstName: row.first_name,
      LastName: row.last_name,
      Company: row.company,
      Email: row.email,
      Phone: row.phone,
      Status: row.status,
      LeadSource: row.lead_source,
      Rating: row.rating,
      Industry: row.industry
    },

    opportunities: {
      ...common,
      AccountId: row.account_id,
      Name: row.name,
      StageName: row.stage_name,
      Amount: numberValue(row.amount),
      CloseDate: row.close_date,
      Probability: numberValue(row.probability)
    },

    cases: {
      ...common,
      CaseNumber: row.case_number,
      AccountId: row.account_id,
      ContactId: row.contact_id,
      Subject: row.subject,
      Description: row.description,
      Status: row.status,
      Priority: row.priority,
      Origin: row.origin
    },

    tasks: {
      ...common,
      Subject: row.subject,
      Status: row.status,
      Priority: row.priority,
      ActivityDate: row.activity_date,

      RelatedToId:
        row.related_account_id ||
        row.related_contact_id ||
        row.related_lead_id ||
        row.related_opportunity_id ||
        row.related_case_id ||
        null,

      RelatedToType:
        row.related_account_id ? 'accounts' :
        row.related_contact_id ? 'contacts' :
        row.related_lead_id ? 'leads' :
        row.related_opportunity_id ? 'opportunities' :
        row.related_case_id ? 'cases' :
        null
    }
  };

  return mappings[obj] || null;
}

function toDatabase(obj, row) {
  const common = {
    id: row.Id,
    owner_id: row.OwnerId || null,
    created_date: sqlDate(row.CreatedDate),
    last_modified_date: sqlDate(row.LastModifiedDate)
  };

  const mappings = {
    accounts: {
      ...common,
      name: row.Name,
      industry: row.Industry || null,
      website: row.Website || null,
      phone: row.Phone || null,
      annual_revenue: row.AnnualRevenue ?? null,
      billing_city: row.BillingCity || null
    },

    contacts: {
      ...common,
      account_id: row.AccountId || null,
      first_name: row.FirstName || null,
      last_name: row.LastName,
      email: row.Email || null,
      phone: row.Phone || null,
      title: row.Title || null
    },

    leads: {
      ...common,
      first_name: row.FirstName || null,
      last_name: row.LastName,
      company: row.Company,
      email: row.Email || null,
      phone: row.Phone || null,
      status: row.Status,
      lead_source: row.LeadSource || null,
      rating: row.Rating || null,
      industry: row.Industry || null
    },

    opportunities: {
      ...common,
      account_id: row.AccountId || null,
      name: row.Name,
      stage_name: row.StageName,
      amount: row.Amount ?? 0,
      close_date: row.CloseDate || null,
      probability: row.Probability ?? 0
    },

    cases: {
      ...common,
      account_id: row.AccountId || null,
      contact_id: row.ContactId || null,
      case_number: row.CaseNumber,
      subject: row.Subject,
      description: row.Description || null,
      status: row.Status,
      priority: row.Priority,
      origin: row.Origin
    },

    tasks: {
      ...common,
      subject: row.Subject,
      status: row.Status,
      priority: row.Priority,
      activity_date: row.ActivityDate || null,
      related_account_id: null,
      related_contact_id: null,
      related_lead_id: null,
      related_opportunity_id: null,
      related_case_id: null
    }
  };

  const result = mappings[obj];

  if (!result) {
    throw new CRMError('Unsupported database object: ' + obj);
  }

  if (obj === 'tasks' && row.RelatedToId) {
    const relationshipColumns = {
      accounts: 'related_account_id',
      contacts: 'related_contact_id',
      leads: 'related_lead_id',
      opportunities: 'related_opportunity_id',
      cases: 'related_case_id'
    };

    const column = relationshipColumns[row.RelatedToType];

    if (!column) {
      throw new CRMError(
        'Invalid task relationship type: ' + row.RelatedToType
      );
    }

    result[column] = row.RelatedToId;
  }

  return result;
}

function fromAuditDatabase(row) {
  return {
    id: row.id,
    at: row.at,
    actorId: row.actor_id,
    actorName: row.actor_name,
    object: row.object_name,
    operation: row.operation,
    recordId: row.record_id || '',
    label: row.label || '',
    details: row.details || ''
  };
}

function fromFlowDatabase(row) {
  return {
    Id: row.id,
    name: row.name,
    triggerId: row.trigger_id,
    actionDescription: row.action_description,
    at: row.at
  };
}

// ==================================================
// CRM SERVICE
// ==================================================

class CRMService {

  // ------------------------------------------------
  // ERROR HANDLING
  // ------------------------------------------------

  error(message, status = 400) {
    throw new CRMError(message, status);
  }

  // ------------------------------------------------
  // NESTJS LIFECYCLE
  // ------------------------------------------------

  async onModuleInit() {
    await this.initializeEngine();
  }

  // ------------------------------------------------
  // USERS AND PERMISSIONS
  // ------------------------------------------------

  userById(id) {
    return USERS.find(user => user.Id === id);
  }

  currentUser(id) {
    const user = this.userById(id);

    if (!user) {
      this.error('Unknown classroom persona', 400);
    }

    return user;
  }

  can(user, obj, verb) {
    return !!ROLE_PERMISSIONS[user.Role]?.[obj]?.includes(verb);
  }

  checkObject(user, obj, verb) {
    if (!OBJECTS[obj]) {
      this.error('Unknown Salesforce-style object: ' + obj, 404);
    }

    if (!this.can(user, obj, verb)) {
      this.error(
        `${user.Role} does not have ${verb} permission on ${OBJECTS[obj].singular}`,
        403
      );
    }
  }

  checkOwner(user, obj, row, verb) {
    if (
      user.Role === 'Administrator' ||
      user.Role === 'Sales Manager'
    ) {
      return;
    }

    if (user.Role === 'Sales Representative') {
      if (
        (obj === 'leads' || obj === 'opportunities') &&
        row.OwnerId !== user.Id
      ) {
        this.error('Record sharing: this record is not owned by you', 403);
      }

      if (verb !== 'R' && row.OwnerId !== user.Id) {
        this.error('Record edit access denied: another owner', 403);
      }
    }

    if (
      user.Role === 'Support Agent' &&
      obj === 'cases' &&
      row.OwnerId !== user.Id
    ) {
      this.error('Case queue sharing denied', 403);
    }

    if (
      user.Role === 'Support Agent' &&
      obj === 'tasks' &&
      verb !== 'R' &&
      row.OwnerId !== user.Id
    ) {
      this.error('Task ownership restriction', 403);
    }
  }

  visible(user, obj, row) {
    try {
      this.checkOwner(user, obj, row, 'R');
      return true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------------
  // FIELD-LEVEL SECURITY
  // ------------------------------------------------

  HIDDEN_FIELDS = {
    'Sales Representative': {
      accounts: ['AnnualRevenue']
    },

    'Support Agent': {
      accounts: ['AnnualRevenue']
    }
  };

  fieldAllowed(user, obj, field) {
    return !(
      this.HIDDEN_FIELDS[user.Role]?.[obj] || []
    ).includes(field);
  }

  sanitize(user, obj, row) {
    if (!row) return null;

    const output = {};

    for (const [key, value] of Object.entries(row)) {
      if (this.fieldAllowed(user, obj, key)) {
        output[key] = value;
      }
    }

    return output;
  }

  // ------------------------------------------------
  // DATABASE HELPERS
  // ------------------------------------------------

  async rowsFor(obj) {
    if (!TABLES.has(obj)) {
      this.error('Unknown object', 404);
    }

    const rows = await query(`SELECT * FROM ${obj}`);

    return rows.map(row => fromDatabase(obj, row));
  }

  async getRaw(obj, id, executor = { query }) {
    if (!TABLES.has(obj)) {
      this.error('Unknown object', 404);
    }

    const rows = await executor.query(
      `SELECT * FROM ${obj} WHERE id = ? LIMIT 1`,
      [id]
    );

    return rows.length ? fromDatabase(obj, rows[0]) : null;
  }

  async insertRecord(obj, row, executor = { query }) {
    const data = toDatabase(obj, row);

    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');

    await executor.query(
      `INSERT INTO ${obj} (${columns.join(', ')})
       VALUES (${placeholders})`,
      values
    );
  }

  async updateRecord(obj, row, executor = { query }) {
    const data = toDatabase(obj, row);

    const columns = Object.keys(data)
      .filter(column => column !== 'id');

    const assignments = columns
      .map(column => `${column} = ?`)
      .join(', ');

    const values = columns.map(column => data[column]);
    values.push(row.Id);

    await executor.query(
      `UPDATE ${obj}
       SET ${assignments}
       WHERE id = ?`,
      values
    );
  }

  async deleteRecord(obj, id, executor = { query }) {
    await executor.query(
      `DELETE FROM ${obj} WHERE id = ?`,
      [id]
    );
  }

  // ------------------------------------------------
  // AUDIT AND WORKFLOW HELPERS
  // ------------------------------------------------

  async insertAudit(item, executor = { query }) {
    await executor.query(
      `INSERT INTO audit_logs
       (id, at, actor_id, actor_name, object_name,
        operation, record_id, label, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        sqlDate(item.at),
        item.actorId,
        item.actorName || null,
        item.object,
        item.operation,
        item.recordId || null,
        item.label || null,
        item.details || null
      ]
    );
  }

  async addAudit(
    user,
    obj,
    operation,
    row,
    details = '',
    executor = { query }
  ) {
    const item = {
      id: randomBytes(5).toString('hex'),
      at: stamp(),
      actorId: user.Id,
      actorName: user.Name,
      object: obj,
      operation,
      recordId: row?.Id || '',
      label:
        row?.Name ||
        row?.Subject ||
        [row?.FirstName, row?.LastName].filter(Boolean).join(' '),
      details
    };

    await this.insertAudit(item, executor);
  }

  async insertFlow(item, executor = { query }) {
    await executor.query(
      `INSERT INTO workflow_runs
       (id, name, trigger_id, action_description, at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        item.Id,
        item.name,
        item.triggerId || null,
        item.actionDescription || null,
        sqlDate(item.at)
      ]
    );
  }

  async addFlow(
    name,
    triggerId,
    actionDescription,
    executor = { query }
  ) {
    const item = {
      Id: randomBytes(7).toString('hex'),
      name,
      triggerId,
      actionDescription,
      at: stamp()
    };

    await this.insertFlow(item, executor);
  }

  // ------------------------------------------------
  // INITIALIZE MYSQL ENGINE
  // ------------------------------------------------

  async initializeEngine() {
    await pingDatabase();

    for (const user of USERS) {
      await query(
        `INSERT INTO users
         (id, name, role, initials, color)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         role = VALUES(role),
         initials = VALUES(initials),
         color = VALUES(color)`,
        [
          user.Id,
          user.Name,
          user.Role,
          user.Initials,
          user.Color
        ]
      );
    }

    const counts = await Promise.all(
      [...TABLES].map(async table => {
        const rows = await query(
          `SELECT COUNT(*) AS total FROM ${table}`
        );

        return [table, Number(rows[0].total)];
      })
    );

    // Seed only when every CRM table is empty.
    if (counts.every(([, count]) => count === 0)) {
      const data = seed();

      await withTransaction(async tx => {
        for (const obj of TABLES) {
          for (const row of data[obj] || []) {
            await this.insertRecord(obj, row, tx);
          }
        }

        for (const item of data.audit || []) {
          await this.insertAudit(item, tx);
        }

        for (const item of data.workflowRuns || []) {
          await this.insertFlow(item, tx);
        }
      });
    }

    return { status: 'ready' };
  }

  // ------------------------------------------------
  // GET ALL
  // ------------------------------------------------

  async getAll(user, obj, opts = {}) {
    this.checkObject(user, obj, 'R');

    let records = (await this.rowsFor(obj))
      .filter(row => this.visible(user, obj, row))
      .map(row => this.sanitize(user, obj, row));

    const search = String(opts.q || '').trim().toLowerCase();

    if (search) {
      records = records.filter(row =>
        Object.values(row).some(value =>
          String(value ?? '').toLowerCase().includes(search)
        )
      );
    }

    const sort = opts.sort || 'LastModifiedDate';
    const direction = opts.dir === 'asc' ? 1 : -1;

    if (records.length && Object.hasOwn(records[0], sort)) {
      records.sort((a, b) =>
        String(a[sort] ?? '').localeCompare(String(b[sort] ?? '')) *
        direction
      );
    }

    return records;
  }

  // ------------------------------------------------
  // GET ONE
  // ------------------------------------------------

  async getOne(user, obj, id) {
    this.checkObject(user, obj, 'R');

    const row = await this.getRaw(obj, id);

    if (!row) {
      this.error('Record not found', 404);
    }

    this.checkOwner(user, obj, row, 'R');

    return this.sanitize(user, obj, row);
  }

  // ------------------------------------------------
  // DEFAULT VALUES
  // ------------------------------------------------

  defaults(obj, input) {
    const values = {
      leads: {
        Status: 'New',
        Rating: 'Warm',
        LeadSource: 'Website'
      },

      opportunities: {
        StageName: 'Prospecting',
        Amount: 0
      },

      cases: {
        Status: 'New',
        Priority: 'Medium',
        Origin: 'Web'
      },

      tasks: {
        Status: 'Not Started',
        Priority: 'Normal'
      }
    }[obj] || {};

    return { ...values, ...input };
  }

  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

  async validate(user, obj, input, existing = {}, executor = { query }) {
    const model = OBJECTS[obj];

    if (!model) {
      this.error('Unknown object', 404);
    }

    const allowed = Object.keys(model.fields);
    const value = {};

    for (const [key, raw] of Object.entries(input || {})) {
      if (
        [
          'Id',
          'CreatedDate',
          'LastModifiedDate',
          'CaseNumber',
          'ConvertedAccountId',
          'ConvertedContactId',
          'ConvertedOpportunityId'
        ].includes(key)
      ) {
        this.error(`${key} is a system-managed field`, 400);
      }

      if (!allowed.includes(key)) {
        this.error(`Invalid field ${key} on ${model.singular}`, 400);
      }

      if (!this.fieldAllowed(user, obj, key)) {
        this.error(`Field-level security: ${key} is not writable`, 403);
      }

      if (
        key === 'OwnerId' &&
        !['Administrator', 'Sales Manager'].includes(user.Role) &&
        raw !== user.Id
      ) {
        this.error('Only managers can assign records to another user', 403);
      }

      value[key] = typeof raw === 'string' ? raw.trim() : raw;
    }

    const row = {
      ...this.defaults(obj, {}),
      ...existing,
      ...value
    };

    for (const [key, meta] of Object.entries(model.fields)) {
      if (
        meta.required &&
        (
          row[key] === undefined ||
          row[key] === null ||
          String(row[key]).trim() === ''
        )
      ) {
        this.error(`${meta.label} is required`);
      }

      if (
        meta.type === 'select' &&
        row[key] !== undefined &&
        row[key] !== '' &&
        !meta.options.includes(row[key])
      ) {
        this.error(`Invalid ${key}: must be ${meta.options.join(', ')}`);
      }

      if (
        ['money', 'number'].includes(meta.type) &&
        row[key] !== undefined &&
        row[key] !== null &&
        row[key] !== ''
      ) {
        const number = Number(row[key]);

        if (!Number.isFinite(number) || number < 0) {
          this.error(`${meta.label} must be a non-negative number`);
        }

        row[key] = number;
        value[key] = number;
      }

      if (
        meta.type === 'email' &&
        row[key] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[key])
      ) {
        this.error(`Invalid email address for ${key}`);
      }

      if (
        meta.type === 'date' &&
        row[key] &&
        !/^\d{4}-\d{2}-\d{2}$/.test(row[key])
      ) {
        this.error(`Invalid ${key}; use YYYY-MM-DD`);
      }
    }

    if (
      obj === 'opportunities' &&
      ('StageName' in value || !existing.Id)
    ) {
      value.Probability = STAGE_PROBABILITIES[row.StageName] ?? 10;
    }

    if (
      obj === 'leads' &&
      value.Status === 'Converted' &&
      existing.Status !== 'Converted'
    ) {
      this.error('Use the Convert Lead action instead of setting Converted manually');
    }

    if (
      obj === 'leads' &&
      existing.Status === 'Converted' &&
      value.Status !== undefined &&
      value.Status !== 'Converted'
    ) {
      this.error('Converted leads cannot return to an open status');
    }

    // Validate AccountId and ContactId.
    for (const [field, target] of [
      ['AccountId', 'accounts'],
      ['ContactId', 'contacts']
    ]) {
      if (row[field] && model.fields[field]) {
        const found = await executor.query(
          `SELECT id FROM ${target} WHERE id = ? LIMIT 1`,
          [row[field]]
        );

        if (!found.length) {
          this.error(`${field} references a nonexistent record`);
        }
      }
    }

    // Duplicate Contact email validation.
    if (obj === 'contacts' && row.Email) {
      const found = await executor.query(
        `SELECT id FROM contacts WHERE LOWER(email) = LOWER(?)`,
        [row.Email]
      );

      if (found.some(item => item.id !== existing.Id)) {
        this.error('Duplicate rule: a contact with this email already exists');
      }
    }

    // Task relationship validation.
    if (obj === 'tasks') {
      const relatedId = row.RelatedToId || null;

      if (relatedId) {
        const type = row.RelatedToType || inferTaskType(relatedId);

        const supportedTypes = [
          'accounts',
          'contacts',
          'leads',
          'opportunities',
          'cases'
        ];

        if (!supportedTypes.includes(type)) {
          this.error(
            'Task must be related to an Account, Contact, Lead, Opportunity, or Case'
          );
        }

        const found = await executor.query(
          `SELECT id FROM ${type} WHERE id = ? LIMIT 1`,
          [relatedId]
        );

        if (!found.length) {
          this.error('RelatedToId references a nonexistent record');
        }

        value.RelatedToType = type;
        value.RelatedToId = relatedId;
      } else {
        value.RelatedToId = null;
        value.RelatedToType = null;
      }
    }

    return value;
  }

  // ------------------------------------------------
  // AUTOMATIC TASK CREATION
  // ------------------------------------------------

  async taskFromFlow(
    ownerId,
    subject,
    relatedToId,
    relatedToType,
    priority = 'Normal',
    days = 3,
    executor = { query }
  ) {
    const row = {
      Id: generateId('tasks'),
      CreatedDate: stamp(),
      LastModifiedDate: stamp(),
      OwnerId: ownerId,
      Subject: subject,
      Status: 'Not Started',
      Priority: priority,
      ActivityDate: new Date(
        Date.now() + days * 86400000
      ).toISOString().slice(0, 10),
      RelatedToId: relatedToId,
      RelatedToType: relatedToType
    };

    await this.insertRecord('tasks', row, executor);

    return row;
  }

  // ------------------------------------------------
  // FIRE WORKFLOWS
  // ------------------------------------------------

  async fireFlow(obj, operation, row, previous, executor = { query }) {
    if (obj === 'opportunities' && operation === 'CREATE') {
      await this.taskFromFlow(
        row.OwnerId,
        'Follow up: ' + row.Name,
        row.Id,
        'opportunities',
        'Normal',
        3,
        executor
      );

      await this.addFlow(
        'New opportunity follow-up',
        row.Id,
        'Created a follow-up task automatically',
        executor
      );
    }

    if (
      obj === 'opportunities' &&
      row.StageName === 'Closed Won' &&
      previous?.StageName !== 'Closed Won'
    ) {
      await this.taskFromFlow(
        row.OwnerId,
        'Begin onboarding: ' + row.Name,
        row.Id,
        'opportunities',
        'High',
        1,
        executor
      );

      await this.addFlow(
        'Closed Won onboarding',
        row.Id,
        'Created a customer onboarding task',
        executor
      );
    }

    if (
      obj === 'cases' &&
      ['High', 'Critical'].includes(row.Priority) &&
      (!previous || !['High', 'Critical'].includes(previous.Priority))
    ) {
      await this.taskFromFlow(
        row.OwnerId,
        'Escalate case: ' + row.Subject,
        row.Id,
        'cases',
        'High',
        0,
        executor
      );

      await this.addFlow(
        'High-priority case escalation',
        row.Id,
        'Created an urgent support task',
        executor
      );
    }
  }

  // ------------------------------------------------
  // CREATE
  // ------------------------------------------------

  async create(user, obj, input) {
    this.checkObject(user, obj, 'C');

    return withTransaction(async tx => {
      const values = await this.validate(
        user,
        obj,
        {
          ...input,
          OwnerId: input?.OwnerId || user.Id
        },
        {},
        tx
      );

      const row = {
        Id: generateId(obj),
        CreatedDate: stamp(),
        LastModifiedDate: stamp(),
        ...this.defaults(obj, values)
      };

      if (obj === 'cases') {
        const rows = await tx.query(
          'SELECT COUNT(*) AS total FROM cases'
        );

        row.CaseNumber = String(
          100000 + Number(rows[0].total) + 1
        );
      }

      await this.insertRecord(obj, row, tx);

      await this.addAudit(user, obj, 'CREATE', row, '', tx);

      await this.fireFlow(obj, 'CREATE', row, null, tx);

      return this.sanitize(user, obj, row);
    });
  }

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  async update(user, obj, id, input) {
    this.checkObject(user, obj, 'U');

    return withTransaction(async tx => {
      const row = await this.getRaw(obj, id, tx);

      if (!row) {
        this.error('Record not found', 404);
      }

      this.checkOwner(user, obj, row, 'U');

      const previous = { ...row };

      const values = await this.validate(
        user,
        obj,
        input,
        row,
        tx
      );

      Object.assign(row, values, {
        LastModifiedDate: stamp()
      });

      await this.updateRecord(obj, row, tx);

      await this.addAudit(
        user,
        obj,
        'UPDATE',
        row,
        'Fields: ' + Object.keys(values).join(', '),
        tx
      );

      await this.fireFlow(obj, 'UPDATE', row, previous, tx);

      return this.sanitize(user, obj, row);
    });
  }

  // ------------------------------------------------
  // DELETE
  // ------------------------------------------------

  async remove(user, obj, id) {
    this.checkObject(user, obj, 'D');

    return withTransaction(async tx => {
      const row = await this.getRaw(obj, id, tx);

      if (!row) {
        this.error('Record not found', 404);
      }

      this.checkOwner(user, obj, row, 'D');

      if (obj === 'accounts') {
        const related = await tx.query(
          `SELECT
            (SELECT COUNT(*) FROM contacts WHERE account_id = ?) +
            (SELECT COUNT(*) FROM opportunities WHERE account_id = ?) +
            (SELECT COUNT(*) FROM cases WHERE account_id = ?) AS total`,
          [id, id, id]
        );

        if (Number(related[0].total) > 0) {
          this.error(
            'Relationship rule: cannot delete an Account with related records'
          );
        }
      }

      if (obj === 'contacts') {
        const related = await tx.query(
          'SELECT COUNT(*) AS total FROM cases WHERE contact_id = ?',
          [id]
        );

        if (Number(related[0].total) > 0) {
          this.error(
            'Relationship rule: cannot delete a Contact linked to Cases'
          );
        }
      }

      await this.deleteRecord(obj, id, tx);

      await this.addAudit(user, obj, 'DELETE', row, '', tx);

      return {
        success: true,
        deletedId: id
      };
    });
  }

  // ------------------------------------------------
  // LEAD CONVERSION
  // ------------------------------------------------

  async convertLead(user, id, { createOpportunity = true } = {}) {
    this.checkObject(user, 'leads', 'U');
    this.checkObject(user, 'accounts', 'C');
    this.checkObject(user, 'contacts', 'C');

    if (createOpportunity) {
      this.checkObject(user, 'opportunities', 'C');
    }

    return withTransaction(async tx => {
      const leadRows = await tx.query(
        'SELECT * FROM leads WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!leadRows.length) {
        this.error('Lead not found', 404);
      }

      const lead = fromDatabase('leads', leadRows[0]);

      this.checkOwner(user, 'leads', lead, 'U');

      if (lead.Status === 'Converted') {
        this.error('Lead has already been converted');
      }

      if (lead.Status !== 'Qualified') {
        this.error('Lead must be Qualified before conversion');
      }

      const accountRows = await tx.query(
        `SELECT * FROM accounts
         WHERE LOWER(name) = LOWER(?)
         LIMIT 1`,
        [lead.Company]
      );

      let account = accountRows.length
        ? fromDatabase('accounts', accountRows[0])
        : null;

      if (!account) {
        account = {
          Id: generateId('accounts'),
          OwnerId: lead.OwnerId,
          CreatedDate: stamp(),
          LastModifiedDate: stamp(),
          Name: lead.Company,
          Industry: lead.Industry || 'Other'
        };

        await this.insertRecord('accounts', account, tx);
      }

      const contact = {
        Id: generateId('contacts'),
        OwnerId: lead.OwnerId,
        CreatedDate: stamp(),
        LastModifiedDate: stamp(),
        FirstName: lead.FirstName || '',
        LastName: lead.LastName,
        Email: lead.Email || '',
        Phone: lead.Phone || '',
        AccountId: account.Id
      };

      await this.insertRecord('contacts', contact, tx);

      let opportunity = null;

      if (createOpportunity) {
        opportunity = {
          Id: generateId('opportunities'),
          OwnerId: lead.OwnerId,
          CreatedDate: stamp(),
          LastModifiedDate: stamp(),
          Name: lead.Company + ' – Initial Opportunity',
          AccountId: account.Id,
          StageName: 'Qualification',
          Amount: 0,
          CloseDate: new Date(
            Date.now() + 30 * 86400000
          ).toISOString().slice(0, 10),
          Probability: 25
        };

        await this.insertRecord('opportunities', opportunity, tx);
      }

      Object.assign(lead, {
        Status: 'Converted',
        LastModifiedDate: stamp()
      });

      await tx.query(
        `UPDATE leads
         SET status = ?, last_modified_date = ?
         WHERE id = ?`,
        [
          lead.Status,
          sqlDate(lead.LastModifiedDate),
          id
        ]
      );

      const auditItem = {
        id: randomBytes(5).toString('hex'),
        at: stamp(),
        actorId: user.Id,
        actorName: user.Name,
        object: 'leads',
        operation: 'CONVERT',
        recordId: lead.Id,
        label: [lead.FirstName, lead.LastName].filter(Boolean).join(' '),
        details:
          `Account ${account.Id}; Contact ${contact.Id}; Opportunity ${opportunity?.Id || 'none'}`
      };

      await this.insertAudit(auditItem, tx);

      const task = {
        Id: generateId('tasks'),
        CreatedDate: stamp(),
        LastModifiedDate: stamp(),
        OwnerId: lead.OwnerId,
        Subject: `Welcome call: ${lead.FirstName || ''} ${lead.LastName}`,
        Status: 'Not Started',
        Priority: 'Normal',
        ActivityDate: new Date(
          Date.now() + 86400000
        ).toISOString().slice(0, 10),
        RelatedToId: contact.Id,
        RelatedToType: 'contacts'
      };

      await this.insertRecord('tasks', task, tx);

      await this.insertFlow({
        Id: randomBytes(7).toString('hex'),
        name: 'Lead qualification follow-up',
        triggerId: lead.Id,
        actionDescription:
          'Created Account, Contact' +
          (opportunity ? ', Opportunity' : '') +
          ' and welcome-call task',
        at: stamp()
      }, tx);

      return {
        Lead: this.sanitize(user, 'leads', lead),
        Account: this.sanitize(user, 'accounts', account),
        Contact: this.sanitize(user, 'contacts', contact),
        Opportunity: opportunity
          ? this.sanitize(user, 'opportunities', opportunity)
          : null
      };
    });
  }

  // ------------------------------------------------
  // DASHBOARD STATISTICS
  // ------------------------------------------------

  async stats(user) {
    const all = {};

    for (const obj of Object.keys(OBJECTS)) {
      all[obj] = this.can(user, obj, 'R')
        ? await this.getAll(user, obj)
        : [];
    }

    const active = all.opportunities.filter(
      row => !['Closed Won', 'Closed Lost'].includes(row.StageName)
    );

    const pipeline = active.reduce(
      (sum, row) => sum + Number(row.Amount || 0),
      0
    );

    const weighted = active.reduce(
      (sum, row) =>
        sum + Number(row.Amount || 0) *
        Number(row.Probability || 0) / 100,
      0
    );

    const won = all.opportunities
      .filter(row => row.StageName === 'Closed Won')
      .reduce((sum, row) => sum + Number(row.Amount || 0), 0);

    const breakdown = Object.keys(STAGE_PROBABILITIES).map(stage => ({
      stage,
      count: all.opportunities.filter(
        row => row.StageName === stage
      ).length,
      amount: all.opportunities
        .filter(row => row.StageName === stage)
        .reduce((sum, row) => sum + Number(row.Amount || 0), 0)
    }));

    const auditRows = await query(
      'SELECT * FROM audit_logs ORDER BY at DESC LIMIT 7'
    );

    const flowRows = await query(
      'SELECT * FROM workflow_runs ORDER BY at DESC LIMIT 6'
    );

    return {
      totalLeads: all.leads.length,

      unconvertedLeads: all.leads.filter(
        row => row.Status !== 'Converted'
      ).length,

      totalAccounts: all.accounts.length,
      totalContacts: all.contacts.length,

      openCases: all.cases.filter(
        row => row.Status !== 'Closed'
      ).length,

      overdueTasks: all.tasks.filter(
        row =>
          row.Status !== 'Completed' &&
          row.ActivityDate < new Date().toISOString().slice(0, 10)
      ).length,

      pipeline,
      weighted,
      won,
      breakdown,

      recentActivities: auditRows.map(fromAuditDatabase),
      recentFlows: flowRows.map(fromFlowDatabase)
    };
  }

  // ------------------------------------------------
  // AUDIT HISTORY
  // ------------------------------------------------

  async getAudit(user) {
    if (!['Administrator', 'Sales Manager'].includes(user.Role)) {
      this.error(
        'Only managers and administrators can inspect audit history',
        403
      );
    }

    const rows = await query(
      'SELECT * FROM audit_logs ORDER BY at DESC LIMIT 400'
    );

    return rows.map(fromAuditDatabase);
  }

  // ------------------------------------------------
  // WORKFLOWS
  // ------------------------------------------------

  async getFlows(user) {
    const rows = await query(
      `SELECT * FROM workflow_runs
       ORDER BY at DESC LIMIT ?`,
      [
        ['Administrator', 'Sales Manager'].includes(user.Role)
          ? 100
          : 10
      ]
    );

    return {
      definitions: WORKFLOWS,
      runs: rows.map(fromFlowDatabase)
    };
  }

  // ------------------------------------------------
  // SECURITY
  // ------------------------------------------------

  getSecurity(user) {
    return {
      user,
      roles: USERS,
      permissions: ROLE_PERMISSIONS[user.Role],
      allPermissions: ROLE_PERMISSIONS,
      hiddenFields: this.HIDDEN_FIELDS[user.Role] || {},
      notes:
        'ROLE SIMULATION ONLY: x-demo-user is a trusted classroom selector, NOT real authentication.'
    };
  }

  // ------------------------------------------------
  // METADATA
  // ------------------------------------------------

  getMeta() {
    return {
      objects: OBJECTS,
      users: USERS,
      stages: STAGE_PROBABILITIES
    };
  }

  // ------------------------------------------------
  // RESET DATABASE
  // ------------------------------------------------

  async reset(user) {
    if (user.Role !== 'Administrator') {
      this.error('Administrator role required for reset', 403);
    }

    await withTransaction(async tx => {
      await tx.query('DELETE FROM workflow_runs');
      await tx.query('DELETE FROM audit_logs');

      for (const obj of [
        'tasks',
        'cases',
        'opportunities',
        'leads',
        'contacts',
        'accounts'
      ]) {
        await tx.query(`DELETE FROM ${obj}`);
      }

      const data = seed();

      for (const obj of [
        'accounts',
        'contacts',
        'leads',
        'opportunities',
        'cases',
        'tasks'
      ]) {
        for (const row of data[obj] || []) {
          await this.insertRecord(obj, row, tx);
        }
      }

      for (const item of data.audit || []) {
        await this.insertAudit(item, tx);
      }

      for (const item of data.workflowRuns || []) {
        await this.insertFlow(item, tx);
      }
    });

    return {
      success: true,
      message: 'Sample CRM data restored'
    };
  }

  // ------------------------------------------------
  // DATABASE HEALTH
  // ------------------------------------------------

  async dbHealth() {
    await pingDatabase();

    const counts = {};

    for (const obj of Object.keys(OBJECTS)) {
      const rows = await query(
        `SELECT COUNT(*) AS total FROM ${obj}`
      );

      counts[obj] = Number(rows[0].total);
    }

    return {
      status: 'ok',
      storage: 'MySQL',
      database: process.env.DB_NAME || 'cloudbridge_crm_relational',
      objects: counts
    };
  }
}

// Register the NestJS injectable decorator using JavaScript.
Injectable()(CRMService);

export { CRMService };
