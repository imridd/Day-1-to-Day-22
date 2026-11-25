import 'dotenv/config';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  Injectable,
  Inject
} from '@nestjs/common';

import { DatabaseService } from './database.mjs';
import { USERS } from './model.mjs';

// =====================================================
// CONFIGURATION
// =====================================================

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const JSON_PATH = path.join(
  currentDirectory,
  'data',
  'crm.json'
);

const TABLES = [
  'users',
  'accounts',
  'contacts',
  'leads',
  'opportunities',
  'cases',
  'tasks',
  'audit_logs',
  'workflow_runs'
];

// =====================================================
// MIGRATION SERVICE
// =====================================================

class MigrationService {

  constructor(databaseService) {
    this.databaseService = databaseService;
    this.pool = databaseService.getPool();
  }

  // ===================================================
  // DATE HELPERS
  // ===================================================

  toDateTime(value) {
    if (!value) {
      throw new Error('Required date is missing.');
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }

    return date
      .toISOString()
      .slice(0, 23)
      .replace('T', ' ');
  }

  toDate(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }

    return date.toISOString().slice(0, 10);
  }

  // ===================================================
  // READ JSON DATA
  // ===================================================

  readSourceData() {
    const rawData = readFileSync(
      JSON_PATH,
      'utf8'
    );

    const data = JSON.parse(rawData);

    const requiredCollections = [
      'accounts',
      'contacts',
      'leads',
      'opportunities',
      'cases',
      'tasks',
      'audit',
      'workflowRuns'
    ];

    for (const collection of requiredCollections) {
      if (!Array.isArray(data[collection])) {
        throw new Error(
          `Invalid CRM JSON: "${collection}" must be an array.`
        );
      }
    }

    return data;
  }

  // ===================================================
  // INSERT MULTIPLE ROWS
  // ===================================================

  async insertRows(
    connection,
    table,
    columns,
    rows
  ) {
    if (!rows.length) {
      return;
    }

    // Only predefined table and column names are used.
    const columnNames = columns.join(', ');

    const placeholders = columns
      .map(() => '?')
      .join(', ');

    const sql = `
      INSERT INTO ${table}
      (${columnNames})
      VALUES (${placeholders})
    `;

    for (const row of rows) {
      await connection.execute(sql, row);
    }
  }

  // ===================================================
  // TASK RELATIONSHIP MAPPING
  // ===================================================

  getTaskRelationship(relatedToId) {
    const emptyRelationship = {
      related_account_id: null,
      related_contact_id: null,
      related_lead_id: null,
      related_opportunity_id: null,
      related_case_id: null
    };

    if (!relatedToId) {
      return emptyRelationship;
    }

    const prefix = String(relatedToId).slice(0, 3);

    const relationships = {
      '001': 'related_account_id',
      '003': 'related_contact_id',
      '00Q': 'related_lead_id',
      '006': 'related_opportunity_id',
      '500': 'related_case_id'
    };

    const column = relationships[prefix];

    if (!column) {
      throw new Error(
        `Unknown RelatedToId prefix: ${relatedToId}`
      );
    }

    return {
      ...emptyRelationship,
      [column]: relatedToId
    };
  }

  // ===================================================
  // CHECK DESTINATION TABLES
  // ===================================================

  async checkEmptyTables(connection) {
    for (const table of TABLES) {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total FROM ${table}`
      );

      if (Number(rows[0].total) > 0) {
        throw new Error(
          `Table "${table}" is not empty. ` +
          'Migration stopped to prevent duplicate records.'
        );
      }
    }

    console.log('Destination tables are empty.');
  }

  // ===================================================
  // 1. USERS
  // ===================================================

  async migrateUsers(connection) {
    const rows = USERS.map(user => [
      user.Id,
      user.Name,
      user.Role,
      user.Initials || null,
      user.Color || null
    ]);

    await this.insertRows(
      connection,
      'users',
      [
        'id',
        'name',
        'role',
        'initials',
        'color'
      ],
      rows
    );

    console.log(`Users migrated: ${rows.length}`);
  }

  // ===================================================
  // 2. ACCOUNTS
  // ===================================================

  async migrateAccounts(connection, data) {
    const rows = data.accounts.map(account => [
      account.Id,
      account.OwnerId,
      account.Name,
      account.Industry || null,
      account.Website || null,
      account.Phone || null,
      account.AnnualRevenue ?? null,
      account.BillingCity || null,
      this.toDateTime(account.CreatedDate),
      this.toDateTime(account.LastModifiedDate)
    ]);

    await this.insertRows(
      connection,
      'accounts',
      [
        'id',
        'owner_id',
        'name',
        'industry',
        'website',
        'phone',
        'annual_revenue',
        'billing_city',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Accounts migrated: ${rows.length}`);
  }

  // ===================================================
  // 3. LEADS
  // ===================================================

  async migrateLeads(connection, data) {
    const rows = data.leads.map(lead => [
      lead.Id,
      lead.OwnerId,
      lead.FirstName || null,
      lead.LastName,
      lead.Company,
      lead.Email || null,
      lead.Phone || null,
      lead.Status || null,
      lead.LeadSource || null,
      lead.Rating || null,
      lead.Industry || null,
      this.toDateTime(lead.CreatedDate),
      this.toDateTime(lead.LastModifiedDate)
    ]);

    await this.insertRows(
      connection,
      'leads',
      [
        'id',
        'owner_id',
        'first_name',
        'last_name',
        'company',
        'email',
        'phone',
        'status',
        'lead_source',
        'rating',
        'industry',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Leads migrated: ${rows.length}`);
  }

  // ===================================================
  // 4. CONTACTS
  // ===================================================

  async migrateContacts(connection, data) {
    const rows = data.contacts.map(contact => [
      contact.Id,
      contact.OwnerId,
      contact.AccountId || null,
      contact.FirstName || null,
      contact.LastName,
      contact.Email || null,
      contact.Phone || null,
      contact.Title || null,
      this.toDateTime(contact.CreatedDate),
      this.toDateTime(contact.LastModifiedDate)
    ]);

    await this.insertRows(
      connection,
      'contacts',
      [
        'id',
        'owner_id',
        'account_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'title',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Contacts migrated: ${rows.length}`);
  }

  // ===================================================
  // 5. OPPORTUNITIES
  // ===================================================

  async migrateOpportunities(connection, data) {
    const rows = data.opportunities.map(opportunity => [
      opportunity.Id,
      opportunity.OwnerId,
      opportunity.AccountId,
      opportunity.Name,
      opportunity.StageName || null,
      opportunity.Amount ?? null,
      this.toDate(opportunity.CloseDate),
      opportunity.Probability ?? null,
      this.toDateTime(opportunity.CreatedDate),
      this.toDateTime(opportunity.LastModifiedDate)
    ]);

    await this.insertRows(
      connection,
      'opportunities',
      [
        'id',
        'owner_id',
        'account_id',
        'name',
        'stage_name',
        'amount',
        'close_date',
        'probability',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Opportunities migrated: ${rows.length}`);
  }

  // ===================================================
  // 6. CASES
  // ===================================================

  async migrateCases(connection, data) {
    const rows = data.cases.map(crmCase => [
      crmCase.Id,
      crmCase.OwnerId,
      crmCase.AccountId || null,
      crmCase.ContactId || null,
      crmCase.CaseNumber,
      crmCase.Subject,
      crmCase.Description || null,
      crmCase.Status || null,
      crmCase.Priority || null,
      crmCase.Origin || null,
      this.toDateTime(crmCase.CreatedDate),
      this.toDateTime(crmCase.LastModifiedDate)
    ]);

    await this.insertRows(
      connection,
      'cases',
      [
        'id',
        'owner_id',
        'account_id',
        'contact_id',
        'case_number',
        'subject',
        'description',
        'status',
        'priority',
        'origin',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Cases migrated: ${rows.length}`);
  }

  // ===================================================
  // 7. TASKS
  // ===================================================

  async migrateTasks(connection, data) {
    const rows = data.tasks.map(task => {
      const relationship = this.getTaskRelationship(
        task.RelatedToId
      );

      return [
        task.Id,
        task.OwnerId,
        task.Subject,
        task.Status || null,
        task.Priority || null,
        this.toDate(task.ActivityDate),
        relationship.related_account_id,
        relationship.related_contact_id,
        relationship.related_lead_id,
        relationship.related_opportunity_id,
        relationship.related_case_id,
        this.toDateTime(task.CreatedDate),
        this.toDateTime(task.LastModifiedDate)
      ];
    });

    await this.insertRows(
      connection,
      'tasks',
      [
        'id',
        'owner_id',
        'subject',
        'status',
        'priority',
        'activity_date',
        'related_account_id',
        'related_contact_id',
        'related_lead_id',
        'related_opportunity_id',
        'related_case_id',
        'created_date',
        'last_modified_date'
      ],
      rows
    );

    console.log(`Tasks migrated: ${rows.length}`);
  }

  // ===================================================
  // 8. AUDIT LOGS
  // ===================================================

  async migrateAuditLogs(connection, data) {
    const rows = data.audit.map(log => [
      log.id,
      this.toDateTime(log.at),
      log.actorId,
      log.actorName || null,
      log.object,
      log.operation,
      log.recordId || null,
      log.label || null,
      log.details || null
    ]);

    await this.insertRows(
      connection,
      'audit_logs',
      [
        'id',
        'at',
        'actor_id',
        'actor_name',
        'object_name',
        'operation',
        'record_id',
        'label',
        'details'
      ],
      rows
    );

    console.log(`Audit logs migrated: ${rows.length}`);
  }

  // ===================================================
  // 9. WORKFLOW RUNS
  // ===================================================

  async migrateWorkflowRuns(connection, data) {
    const rows = data.workflowRuns.map(workflow => [
      workflow.Id,
      workflow.name,
      workflow.triggerId || null,
      workflow.actionDescription || null,
      this.toDateTime(workflow.at)
    ]);

    await this.insertRows(
      connection,
      'workflow_runs',
      [
        'id',
        'name',
        'trigger_id',
        'action_description',
        'at'
      ],
      rows
    );

    console.log(`Workflow runs migrated: ${rows.length}`);
  }

  // ===================================================
  // VERIFY MIGRATION COUNTS
  // ===================================================

  async verifyMigration(connection, data) {
    const expectedCounts = {
      users: USERS.length,
      accounts: data.accounts.length,
      contacts: data.contacts.length,
      leads: data.leads.length,
      opportunities: data.opportunities.length,
      cases: data.cases.length,
      tasks: data.tasks.length,
      audit_logs: data.audit.length,
      workflow_runs: data.workflowRuns.length
    };

    for (const [table, expected] of Object.entries(expectedCounts)) {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS total FROM ${table}`
      );

      const actual = Number(rows[0].total);

      if (actual !== expected) {
        throw new Error(
          `${table}: expected ${expected}, found ${actual}`
        );
      }
    }

    return expectedCounts;
  }

  // ===================================================
  // MAIN MIGRATION METHOD
  // ===================================================

  async migrate() {
    let connection;

    try {
      console.log('\nStarting relational database migration...\n');

      const data = this.readSourceData();

      connection = await this.pool.getConnection();

      console.log('Connected to MySQL.');
      console.log(
        `Database: ${process.env.DB_NAME || 'cloudbridge_crm_relational'}`
      );

      // Stop if destination tables already contain data.
      await this.checkEmptyTables(connection);

      // Start transaction.
      await connection.beginTransaction();

      // Migrate all tables.
      await this.migrateUsers(connection);
      await this.migrateAccounts(connection, data);
      await this.migrateLeads(connection, data);
      await this.migrateContacts(connection, data);
      await this.migrateOpportunities(connection, data);
      await this.migrateCases(connection, data);
      await this.migrateTasks(connection, data);
      await this.migrateAuditLogs(connection, data);
      await this.migrateWorkflowRuns(connection, data);

      // Verify inserted records before committing.
      const counts = await this.verifyMigration(
        connection,
        data
      );

      await connection.commit();

      console.log('\n------------------------------------');
      console.log('RELATIONAL MIGRATION SUCCESSFUL');
      console.log('------------------------------------');

      for (const [table, count] of Object.entries(counts)) {
        console.log(`${table}: ${count}`);
      }

      console.log('------------------------------------\n');

      return {
        success: true,
        message: 'Relational migration completed successfully',
        counts
      };

    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            'Rollback failed:',
            rollbackError.message
          );
        }
      }

      console.error('\nMIGRATION FAILED');
      console.error(error.message);

      throw error;

    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

// =====================================================
// NESTJS DECORATOR REGISTRATION
// =====================================================

// Register MigrationService as a NestJS provider.
Injectable()(MigrationService);

// Inject DatabaseService into the constructor.
Inject(DatabaseService)(
  MigrationService,
  undefined,
  0
);

export { MigrationService };