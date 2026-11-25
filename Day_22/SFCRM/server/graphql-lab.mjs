
/**
 * Educational GraphQL SUBSET for relational MySQL storage.
 *
 * Supports:
 * - Query and mutation operations
 * - Variables
 * - Selection projection
 * - Connection edges and nodes
 * - totalCount and pageInfo
 * - CRUD mutations for six CRM objects
 *
 * IMPORTANT:
 * This file does not access MySQL directly.
 * All database operations go through CRMService.
 *
 * This is NOT a full GraphQL implementation.
 * It does not support aliases, fragments, directives,
 * subscriptions or introspection.
 */

import { OBJECTS } from './model.mjs';
import { CRMError } from './engine.mjs';

// --------------------------------------------------
// OBJECT NAME MAPPING
// --------------------------------------------------

const names = Object.fromEntries(
  Object.entries(OBJECTS).map(([key, value]) => [
    value.singular,
    key
  ])
);

const whitespaceOrComma = /\s|,/;

// --------------------------------------------------
// GRAPHQL TOKEN SCANNER
// --------------------------------------------------

function scan(input) {
  const tokens = [];

  let i = 0;

  while (i < input.length) {
    const character = input[i];

    // Ignore whitespace and commas
    if (whitespaceOrComma.test(character)) {
      i++;
      continue;
    }

    // Ignore comments
    if (character === '#') {
      while (i < input.length && input[i] !== '\n') {
        i++;
      }

      continue;
    }

    // Names
    if (/[A-Za-z_]/.test(character)) {
      let j = i + 1;

      while (
        j < input.length &&
        /[A-Za-z0-9_]/.test(input[j])
      ) {
        j++;
      }

      tokens.push({
        type: 'name',
        value: input.slice(i, j)
      });

      i = j;
      continue;
    }

    // String values
    if (character === '"') {
      let j = i + 1;
      let escaped = false;

      for (; j < input.length; j++) {
        if (!escaped && input[j] === '"') {
          break;
        }

        if (input[j] === '\\' && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
      }

      if (j >= input.length) {
        throw new Error('Unterminated string');
      }

      const raw = input.slice(i, j + 1);

      tokens.push({
        type: 'string',
        value: JSON.parse(raw)
      });

      i = j + 1;
      continue;
    }

    // Number values
    if (/[0-9-]/.test(character)) {
      let j = i + 1;

      while (
        j < input.length &&
        /[0-9.eE+-]/.test(input[j])
      ) {
        j++;
      }

      const number = Number(input.slice(i, j));

      if (!Number.isFinite(number)) {
        throw new Error('Invalid number');
      }

      tokens.push({
        type: 'number',
        value: number
      });

      i = j;
      continue;
    }

    // Supported punctuation
    if ('{}():$![]=|'.includes(character)) {
      tokens.push({
        type: character,
        value: character
      });

      i++;
      continue;
    }

    throw new Error(
      `Unsupported GraphQL token '${character}'. ` +
      'This is an educational GraphQL subset.'
    );
  }

  return tokens;
}

// --------------------------------------------------
// GRAPHQL PARSER
// --------------------------------------------------

function parse(document, variables = {}) {
  if (!document.trim()) {
    throw new Error('GraphQL query cannot be empty');
  }

  const tokens = scan(document);

  const state = {
    index: 0
  };

  const peek = () => tokens[state.index];

  const consume = () => {
    const token = tokens[state.index];
    state.index++;
    return token;
  };

  const eat = expected => {
    const token = consume();

    if (!token || token.value !== expected) {
      throw new Error(
        `Expected '${expected}', found '${token?.value ?? 'end of input'}'`
      );
    }

    return token;
  };

  const expectName = () => {
    const token = consume();

    if (!token || token.type !== 'name') {
      throw new Error('Expected a GraphQL name');
    }

    return token.value;
  };

  // ------------------------------------------------
  // VALUE PARSER
  // ------------------------------------------------

  function parseValue() {
    const token = peek();

    if (!token) {
      throw new Error('Expected a value');
    }

    // Variable
    if (token.value === '$') {
      consume();

      const variableName = expectName();

      if (!Object.hasOwn(variables, variableName)) {
        throw new Error(
          `Variable '$${variableName}' was not provided`
        );
      }

      return variables[variableName];
    }

    // Object
    if (token.value === '{') {
      eat('{');

      const result = {};

      while (peek() && peek().value !== '}') {
        const key = expectName();

        eat(':');

        result[key] = parseValue();
      }

      eat('}');

      return result;
    }

    // Array
    if (token.value === '[') {
      eat('[');

      const result = [];

      while (peek() && peek().value !== ']') {
        result.push(parseValue());
      }

      eat(']');

      return result;
    }

    consume();

    if (token.type === 'string' || token.type === 'number') {
      return token.value;
    }

    if (token.value === 'true') return true;
    if (token.value === 'false') return false;
    if (token.value === 'null') return null;

    // Enum values
    if (token.type === 'name') {
      return token.value;
    }

    throw new Error(`Unsupported value '${token.value}'`);
  }

  // ------------------------------------------------
  // ARGUMENT PARSER
  // ------------------------------------------------

  function parseArguments() {
    const result = {};

    if (peek()?.value !== '(') {
      return result;
    }

    eat('(');

    while (peek() && peek().value !== ')') {
      const key = expectName();

      eat(':');

      result[key] = parseValue();
    }

    eat(')');

    return result;
  }

  // ------------------------------------------------
  // SELECTION SET PARSER
  // ------------------------------------------------

  function parseFields() {
    eat('{');

    const result = [];

    while (peek() && peek().value !== '}') {
      const name = expectName();

      const args = parseArguments();

      const selection =
        peek()?.value === '{'
          ? parseFields()
          : null;

      result.push({
        name,
        args,
        select: selection
      });
    }

    eat('}');

    return result;
  }

  // ------------------------------------------------
  // OPERATION PARSER
  // ------------------------------------------------

  let operation = 'query';

  if (['query', 'mutation'].includes(peek()?.value)) {
    operation = consume().value;

    // Optional operation name
    if (peek()?.type === 'name') {
      consume();
    }

    // Skip variable definitions
    if (peek()?.value === '(') {
      let depth = 0;

      do {
        const token = consume();

        if (token.value === '(') depth++;
        if (token.value === ')') depth--;
      } while (depth > 0 && peek());

      if (depth !== 0) {
        throw new Error('Unclosed variable definition');
      }
    }
  }

  const fields = parseFields();

  if (state.index !== tokens.length) {
    throw new Error(
      'Unexpected tokens after GraphQL operation'
    );
  }

  return {
    operation,
    fields
  };
}

// --------------------------------------------------
// NODE FIELD PROJECTION
// --------------------------------------------------

function nodeProjection(
  crmService,
  user,
  obj,
  row,
  fields
) {
  if (!row) {
    return null;
  }

  const result = {};

  for (const field of fields || []) {
    const name = field.name;

    // ID is a scalar field
    if (name === 'Id') {
      result.Id = row.Id;
      continue;
    }

    // Validate requested field
    if (
      !OBJECTS[obj].fields[name] &&
      ![
        'CreatedDate',
        'LastModifiedDate',
        'CaseNumber'
      ].includes(name)
    ) {
      throw new Error(
        `FieldUndefined: '${name}' is not defined on ` +
        OBJECTS[obj].singular
      );
    }

    // Field-level security
    if (!crmService.fieldAllowed(user, obj, name)) {
      throw new CRMError(
        `Field-level security: '${name}' is not accessible`,
        403
      );
    }

    // CRM fields use { value } or { displayValue }
    if (!field.select) {
      throw new Error(
        `Field '${name}' requires a selection such as { value }`
      );
    }

    const value = row[name] ?? null;

    const detail = {};

    for (const selection of field.select) {
      if (selection.name === 'value') {
        detail.value = value;
      } else if (selection.name === 'displayValue') {
        detail.displayValue = String(value ?? '');
      } else {
        throw new Error(
          `Unknown field-value attribute '${selection.name}'`
        );
      }
    }

    result[name] = detail;
  }

  return result;
}

// --------------------------------------------------
// GRAPHQL QUERIES
// --------------------------------------------------

async function executeQuery(crmService, user, fields) {
  const output = {};

  for (const field of fields) {
    if (field.name !== 'uiapi') {
      throw new Error(
        'Only the uiapi root field is supported'
      );
    }

    const body = {};

    for (const segment of field.select || []) {
      if (segment.name !== 'query') {
        throw new Error(
          'For reads, use uiapi { query { ... } }'
        );
      }

      const collection = {};

      for (const objectField of segment.select || []) {
        const obj = names[objectField.name];

        if (!obj) {
          throw new Error(
            `FieldUndefined: unknown object '${objectField.name}'`
          );
        }

        // Read through CRMService
        const records = await crmService.getAll(user, obj);

        const requestedFirst = Number(
          objectField.args.first ?? 20
        );

        if (!Number.isFinite(requestedFirst)) {
          throw new Error(
            'The first argument must be a number'
          );
        }

        const first = Math.min(
          200,
          Math.max(0, Math.floor(requestedFirst))
        );

        const entries = records
          .slice(0, first)
          .map(record => ({
            node: record,
            cursor: record.Id
          }));

        const connection = {};

        for (const selection of objectField.select || []) {
          if (selection.name === 'totalCount') {
            connection.totalCount = records.length;
          }

          else if (selection.name === 'edges') {
            connection.edges = entries.map(entry => {
              const edge = {};

              for (const sub of selection.select || []) {
                if (sub.name === 'cursor') {
                  edge.cursor = entry.cursor;
                }

                else if (sub.name === 'node') {
                  edge.node = nodeProjection(
                    crmService,
                    user,
                    obj,
                    entry.node,
                    sub.select
                  );
                }

                else {
                  throw new Error(
                    `Unknown edge field '${sub.name}'`
                  );
                }
              }

              return edge;
            });
          }

          else if (selection.name === 'pageInfo') {
            connection.pageInfo = {};

            for (const item of selection.select || []) {
              if (item.name === 'hasNextPage') {
                connection.pageInfo.hasNextPage =
                  records.length > first;
              } else {
                throw new Error(
                  `Unknown pageInfo field '${item.name}'`
                );
              }
            }
          }

          else {
            throw new Error(
              `Unknown connection field '${selection.name}'`
            );
          }
        }

        collection[objectField.name] = connection;
      }

      body.query = collection;
    }

    output.uiapi = body;
  }

  return output;
}

// --------------------------------------------------
// GRAPHQL MUTATIONS
// --------------------------------------------------

async function executeMutation(crmService, user, fields) {
  const output = {};

  for (const root of fields) {
    if (root.name !== 'uiapi') {
      throw new Error(
        'For writes, use the uiapi mutation root'
      );
    }

    const result = {};

    for (const mutation of root.select || []) {
      const match =
        /^(Account|Contact|Lead|Opportunity|Case|Task)(Create|Update|Delete)$/
          .exec(mutation.name);

      if (!match) {
        throw new Error(
          `Mutation not supported: '${mutation.name}'`
        );
      }

      const objectName = match[1];
      const kind = match[2];

      const obj = names[objectName];

      if (!obj) {
        throw new Error(
          `Unknown CRM object '${objectName}'`
        );
      }

      const input = mutation.args.input;

      if (
        !input ||
        typeof input !== 'object' ||
        Array.isArray(input)
      ) {
        throw new Error(
          `Mutation '${mutation.name}' requires an input object`
        );
      }

      let record = null;
      let deletedId = null;

      // CREATE
      if (kind === 'Create') {
        const values = input[objectName] || input;

        record = await crmService.create(
          user,
          obj,
          values
        );
      }

      // UPDATE
      else if (kind === 'Update') {
        const values = input[objectName] || input;

        const id = values.Id || values.id;

        if (!id) {
          throw new Error(
            'Update mutation requires Id'
          );
        }

        record = await crmService.update(
          user,
          obj,
          id,
          values
        );
      }

      // DELETE
      else {
        const id =
          input.Id ||
          input.id ||
          input[objectName]?.Id ||
          input[objectName]?.id;

        if (!id) {
          throw new Error(
            'Delete mutation requires Id'
          );
        }

        const deleted = await crmService.remove(
          user,
          obj,
          id
        );

        deletedId = deleted.deletedId;
      }

      const response = {};

      for (const selection of mutation.select || []) {
        if (selection.name === 'Record') {
          response.Record = record
            ? nodeProjection(
                crmService,
                user,
                obj,
                record,
                selection.select
              )
            : null;
        }

        else if (selection.name === 'success') {
          response.success = true;
        }

        else if (selection.name === 'deletedId') {
          response.deletedId = deletedId;
        }

        else {
          throw new Error(
            `Unsupported mutation response field '${selection.name}'`
          );
        }
      }

      result[mutation.name] = response;
    }

    output.uiapi = result;
  }

  return output;
}

// --------------------------------------------------
// GRAPHQL REQUEST HANDLER
// --------------------------------------------------

export async function handleGraphQL(
  crmService,
  user,
  body = {}
) {
  try {
    if (
      !crmService ||
      typeof crmService.getAll !== 'function' ||
      typeof crmService.create !== 'function' ||
      typeof crmService.update !== 'function' ||
      typeof crmService.remove !== 'function' ||
      typeof crmService.fieldAllowed !== 'function'
    ) {
      throw new Error(
        'A valid CRMService instance is required'
      );
    }

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      throw new Error(
        'GraphQL request body must be an object'
      );
    }

    const document = String(body.query || '');

    const variables = body.variables || {};

    if (
      typeof variables !== 'object' ||
      Array.isArray(variables)
    ) {
      throw new Error(
        'GraphQL variables must be an object'
      );
    }

    const parsed = parse(document, variables);

    const data =
      parsed.operation === 'mutation'
        ? await executeMutation(
            crmService,
            user,
            parsed.fields
          )
        : await executeQuery(
            crmService,
            user,
            parsed.fields
          );

    return {
      data
    };

  } catch (error) {
    return {
      data: null,

      errors: [
        {
          message: error.message,

          extensions: {
            code:
              error instanceof CRMError
                ? 'PERMISSION_OR_VALIDATION'
                : 'GRAPHQL_SUBSET_ERROR'
          }
        }
      ]
    };
  }
}

// --------------------------------------------------
// GRAPHQL PLAYGROUND EXAMPLES
// --------------------------------------------------

export const EXAMPLES = {

  ListContacts: `query ListContacts {
  uiapi {
    query {
      Contact(first: 10) {
        totalCount
        edges {
          node {
            Id
            FirstName { value }
            LastName { value }
            Email { value }
            Phone { value }
          }
        }
      }
    }
  }
}`,

  ListAccounts: `query ListAccounts {
  uiapi {
    query {
      Account(first: 10) {
        totalCount
        edges {
          node {
            Id
            Name { value }
            Industry { value }
            BillingCity { value }
            Website { value }
          }
        }
      }
    }
  }
}`,

  ListLeads: `query ListLeads {
  uiapi {
    query {
      Lead(first: 10) {
        totalCount
        edges {
          node {
            Id
            FirstName { value }
            LastName { value }
            Company { value }
            Status { value }
            Email { value }
          }
        }
      }
    }
  }
}`,

  ListOpportunities: `query OpportunityPipeline {
  uiapi {
    query {
      Opportunity(first: 20) {
        totalCount
        edges {
          node {
            Id
            Name { value }
            StageName { value }
            Amount { value }
            Probability { value }
            CloseDate { value }
          }
        }
      }
    }
  }
}`,

  ListCases: `query CustomerSupport {
  uiapi {
    query {
      Case(first: 20) {
        totalCount
        edges {
          node {
            Id
            CaseNumber { value }
            Subject { value }
            Status { value }
            Priority { value }
          }
        }
      }
    }
  }
}`,

  ListTasks: `query TaskList {
  uiapi {
    query {
      Task(first: 20) {
        totalCount
        edges {
          node {
            Id
            Subject { value }
            Status { value }
            Priority { value }
            ActivityDate { value }
          }
        }
      }
    }
  }
}`,

  CreateContact: `mutation CreateContact($input: ContactCreateInput!) {
  uiapi {
    ContactCreate(input: $input) {
      Record {
        Id
        FirstName { value }
        LastName { value }
        Email { value }
      }
      success
    }
  }
}`,

  UpdateContact: `mutation UpdateContact($input: ContactUpdateInput!) {
  uiapi {
    ContactUpdate(input: $input) {
      Record {
        Id
        FirstName { value }
        LastName { value }
        Email { value }
      }
      success
    }
  }
}`,

  DeleteContact: `mutation DeleteContact($input: ContactDeleteInput!) {
  uiapi {
    ContactDelete(input: $input) {
      success
      deletedId
    }
  }
}`
};
