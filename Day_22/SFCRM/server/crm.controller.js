
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Inject,
  HttpException
} from '@nestjs/common';

import { CRMService } from './engine.mjs';
import { handleGraphQL } from './graphql-lab.mjs';

// --------------------------------------------------
// ALLOWED CRM OBJECTS
// --------------------------------------------------

const ALLOWED_OBJECTS = new Set([
  'accounts',
  'contacts',
  'leads',
  'opportunities',
  'cases',
  'tasks'
]);

// --------------------------------------------------
// GRAPHQL EXAMPLES
// --------------------------------------------------

const GRAPHQL_EXAMPLES = {
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
            }
          }
        }
      }
    }
  }`
};

// --------------------------------------------------
// CRM CONTROLLER
// --------------------------------------------------

class CRMController {
  constructor(crmService) {
    this.crmService = crmService;
  }

  // USER IDENTIFICATION

  getUserId(req) {
    return req.headers['x-demo-user'] || 'u1';
  }

  getCurrentUser(req) {
    return this.crmService.currentUser(
      this.getUserId(req)
    );
  }

  // OBJECT VALIDATION

  validateObject(object) {
    if (!ALLOWED_OBJECTS.has(object)) {
      throw new HttpException(
        `Unsupported CRM object: ${object}`,
        404
      );
    }
  }

  // COMMON ERROR HANDLER

  async execute(work) {
    try {
      return await work();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'CRM operation failed',
        Number(error.status) || 500
      );
    }
  }

  // ------------------------------------------------
  // SESSION
  // GET /api/session
  // ------------------------------------------------

  async getSession(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      const metadata = this.crmService.getMeta();

      return {
        user,
        availableUsers: metadata.users || []
      };
    });
  }

  // ------------------------------------------------
  // GRAPHQL
  // POST /api/graphql
  // ------------------------------------------------

  async graphql(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);

      return handleGraphQL(
        this.crmService,
        user,
        req.body || {}
      );
    });
  }

  // ------------------------------------------------
  // GRAPHQL EXAMPLES
  // GET /api/graphql-examples
  // ------------------------------------------------

  async getGraphQLExamples() {
    return GRAPHQL_EXAMPLES;
  }

  // ------------------------------------------------
  // METADATA
  // GET /api/metadata
  // ------------------------------------------------

  async getMetadata(req) {
    return this.execute(async () => {
      this.getCurrentUser(req);
      return this.crmService.getMeta();
    });
  }

  // ------------------------------------------------
  // OVERVIEW
  // GET /api/overview
  // ------------------------------------------------

  async getOverview(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      return this.crmService.stats(user);
    });
  }

  // ------------------------------------------------
  // SECURITY
  // GET /api/security
  // ------------------------------------------------

  async getSecurity(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      return this.crmService.getSecurity(user);
    });
  }

  // ------------------------------------------------
  // WORKFLOWS
  // GET /api/workflows
  // ------------------------------------------------

  async getWorkflows(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      return this.crmService.getFlows(user);
    });
  }

  // ------------------------------------------------
  // AUDIT
  // GET /api/audit
  // ------------------------------------------------

  async getAudit(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      return this.crmService.getAudit(user);
    });
  }

  // ------------------------------------------------
  // RESET SAMPLE DATA
  // POST /api/reset
  // ------------------------------------------------

  async reset(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      return this.crmService.reset(user);
    });
  }

  // ------------------------------------------------
  // CONVERT LEAD
  // POST /api/leads/:id/convert
  // ------------------------------------------------

  async convertLead(req) {
    return this.execute(async () => {
      const user = this.getCurrentUser(req);
      const { object, id } = req.params;

      this.validateObject(object);

      if (object !== 'leads') {
        throw new HttpException(
          'Only Leads can be converted',
          400
        );
      }

      return this.crmService.convertLead(
        user,
        id,
        {
          createOpportunity:
            req.body?.createOpportunity !== false
        }
      );
    });
  }

  // ------------------------------------------------
  // GET ALL RECORDS
  // GET /api/:object
  // ------------------------------------------------

  async getAll(req) {
    return this.execute(async () => {
      const { object } = req.params;

      this.validateObject(object);

      const user = this.getCurrentUser(req);

      return this.crmService.getAll(
        user,
        object,
        req.query || {}
      );
    });
  }

  // ------------------------------------------------
  // GET ONE RECORD
  // GET /api/:object/:id
  // ------------------------------------------------

  async getOne(req) {
    return this.execute(async () => {
      const { object, id } = req.params;

      this.validateObject(object);

      const user = this.getCurrentUser(req);

      return this.crmService.getOne(
        user,
        object,
        id
      );
    });
  }

  // ------------------------------------------------
  // CREATE RECORD
  // POST /api/:object
  // ------------------------------------------------

  async create(req) {
    return this.execute(async () => {
      const { object } = req.params;

      this.validateObject(object);

      const user = this.getCurrentUser(req);

      return this.crmService.create(
        user,
        object,
        req.body || {}
      );
    });
  }

  // ------------------------------------------------
  // UPDATE RECORD
  // PATCH /api/:object/:id
  // ------------------------------------------------

  async update(req) {
    return this.execute(async () => {
      const { object, id } = req.params;

      this.validateObject(object);

      const user = this.getCurrentUser(req);

      return this.crmService.update(
        user,
        object,
        id,
        req.body || {}
      );
    });
  }

  // ------------------------------------------------
  // DELETE RECORD
  // DELETE /api/:object/:id
  // ------------------------------------------------

  async remove(req) {
    return this.execute(async () => {
      const { object, id } = req.params;

      this.validateObject(object);

      const user = this.getCurrentUser(req);

      return this.crmService.remove(
        user,
        object,
        id
      );
    });
  }
}

// --------------------------------------------------
// NESTJS DECORATORS
// --------------------------------------------------

Controller()(CRMController);

Inject(CRMService)(
  CRMController,
  undefined,
  0
);

// --------------------------------------------------
// ROUTE DEFINITIONS
// Static routes before dynamic routes
// --------------------------------------------------

const routes = [
  // Session
  ['getSession', Get('session')],

  // GraphQL
  ['graphql', Post('graphql')],
  ['getGraphQLExamples', Get('graphql-examples')],

  // Dashboard and platform
  ['getMetadata', Get('metadata')],
  ['getOverview', Get('overview')],
  ['getSecurity', Get('security')],
  ['getWorkflows', Get('workflows')],
  ['getAudit', Get('audit')],

  // Special operations
  ['reset', Post('reset')],
  ['convertLead', Post(':object/:id/convert')],

  // CRM records
  ['getAll', Get(':object')],
  ['getOne', Get(':object/:id')],
  ['create', Post(':object')],
  ['update', Patch(':object/:id')],
  ['remove', Delete(':object/:id')]
];

// --------------------------------------------------
// APPLY ROUTE AND REQUEST DECORATORS
// --------------------------------------------------

for (const [method, decorator] of routes) {
  decorator(
    CRMController.prototype,
    method,
    Object.getOwnPropertyDescriptor(
      CRMController.prototype,
      method
    )
  );

  Req()(
    CRMController.prototype,
    method,
    0
  );
}

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

export { CRMController };
