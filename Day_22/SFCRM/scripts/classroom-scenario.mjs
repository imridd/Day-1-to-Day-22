
import 'dotenv/config';

import {
  Injectable
} from '@nestjs/common';

// ==================================================
// CONFIGURATION
// ==================================================

class DemoConfig {

  constructor() {
    this.baseUrl =
      process.env.API_BASE || 'http://127.0.0.1:4100';

    this.headers = {
      'content-type': 'application/json',
      'x-demo-user': 'u1'
    };

    this.frontendUrl = 'http://127.0.0.1:5173';
  }

}

// ==================================================
// CRM DEMO SERVICE
// ==================================================

class CRMDemoService {

  constructor() {
    this.config = new DemoConfig();
  }

  // ----------------------------------------------
  // HTTP REQUEST HELPER
  // ----------------------------------------------

  async request(path, method = 'GET', body) {

    const response = await fetch(
      `${this.config.baseUrl}/api${path}`,
      {
        method,
        headers: this.config.headers,

        body: body === undefined
          ? undefined
          : JSON.stringify(body)
      }
    );

    let json;

    try {
      json = await response.json();
    } catch {
      throw new Error(
        `Invalid JSON response from ${path}`
      );
    }

    if (!response.ok) {
      throw new Error(
        json.error || `HTTP ${response.status}`
      );
    }

    return json;
  }

  // ----------------------------------------------
  // GENERATE UNIQUE DEMO SUFFIX
  // ----------------------------------------------

  generateSuffix() {
    return Math.floor(Date.now() % 100000);
  }

  // ----------------------------------------------
  // CREATE QUALIFIED LEAD
  // ----------------------------------------------

  async createLead(suffix) {

    const lead = await this.request(
      '/leads',
      'POST',
      {
        FirstName: 'Priya',
        LastName: 'Demo',
        Company: `Nova Robotics ${suffix}`,
        Email: `priya.demo${suffix}@example.com`,
        Status: 'Qualified',
        LeadSource: 'Webinar',
        Rating: 'Hot'
      }
    );

    console.log(
      '1. Qualified Lead created:',
      lead.Id,
      lead.Company
    );

    return lead;
  }

  // ----------------------------------------------
  // CONVERT LEAD
  // ----------------------------------------------

  async convertLead(leadId) {

    const conversion = await this.request(
      `/leads/${leadId}/convert`,
      'POST',
      {
        createOpportunity: true
      }
    );

    console.log(
      '2. Converted → Account:',
      conversion.Account.Id,
      'Contact:',
      conversion.Contact.Id,
      'Opportunity:',
      conversion.Opportunity.Id
    );

    return conversion;
  }

  // ----------------------------------------------
  // CLOSE OPPORTUNITY
  // ----------------------------------------------

  async closeOpportunity(opportunityId) {

    const won = await this.request(
      `/opportunities/${opportunityId}`,
      'PATCH',
      {
        StageName: 'Closed Won',
        Amount: 125000
      }
    );

    console.log(
      '3. Opportunity moved to',
      won.StageName,
      'with Probability',
      won.Probability
    );

    return won;
  }

  // ----------------------------------------------
  // CREATE CRITICAL CASE
  // ----------------------------------------------

  async createCase(account, contact) {

    const caseRecord = await this.request(
      '/cases',
      'POST',
      {
        Subject:
          `Critical integration issue for ${account.Name}`,

        AccountId: account.Id,

        ContactId: contact.Id,

        Priority: 'Critical',

        Status: 'New',

        Origin: 'Web'
      }
    );

    console.log(
      '4. Critical Case created:',
      caseRecord.Id,
      'CaseNumber:',
      caseRecord.CaseNumber
    );

    return caseRecord;
  }

  // ----------------------------------------------
  // CHECK RELATED TASKS
  // ----------------------------------------------

  async checkRelatedTasks(ids) {

    const tasks = await this.request('/tasks');

    const relatedTasks = tasks.filter(task =>
      ids.includes(task.RelatedToId)
    );

    console.log(
      '5. Related tasks:',
      relatedTasks.map(task => task.Subject)
    );

    return relatedTasks;
  }

  // ----------------------------------------------
  // CHECK WORKFLOW EVENTS
  // ----------------------------------------------

  async checkWorkflowEvents() {

    const runs = await this.request('/workflows');

    console.log(
      '6. Automation events:',
      runs.runs.length
    );

    return runs;
  }

  // ----------------------------------------------
  // RUN COMPLETE DEMO SCENARIO
  // ----------------------------------------------

  async runDemo() {

    console.log('\nStarting CRM demonstration...\n');

    try {

      const suffix = this.generateSuffix();

      // 1. Create Lead
      const lead = await this.createLead(suffix);

      // 2. Convert Lead
      const conversion = await this.convertLead(
        lead.Id
      );

      // 3. Close Opportunity
      const won = await this.closeOpportunity(
        conversion.Opportunity.Id
      );

      // 4. Create Case
      const caseRecord = await this.createCase(
        conversion.Account,
        conversion.Contact
      );

      // 5. Check related Tasks
      const relatedIds = [
        lead.Id,
        conversion.Contact.Id,
        won.Id,
        caseRecord.Id
      ];

      const tasks = await this.checkRelatedTasks(
        relatedIds
      );

      // 6. Check Workflow Events
      const workflows = await this.checkWorkflowEvents();

      console.log('\n--------------------------------');
      console.log('CRM DEMO COMPLETED SUCCESSFULLY');
      console.log('--------------------------------');

      console.log('Lead:', lead.Id);
      console.log('Account:', conversion.Account.Id);
      console.log('Contact:', conversion.Contact.Id);
      console.log('Opportunity:', won.Id);
      console.log('Case:', caseRecord.Id);
      console.log('Related Tasks:', tasks.length);
      console.log('Workflow Runs:', workflows.runs.length);

      console.log(
        `\nOpen ${this.config.frontendUrl} to inspect records and dashboards.`
      );

      return {
        success: true,
        lead,
        conversion,
        opportunity: won,
        caseRecord,
        tasks,
        workflows
      };

    } catch (error) {

      console.error(
        'Demo scenario failed:',
        error.message
      );

      throw error;
    }
  }

}

// ==================================================
// NESTJS DECORATOR REGISTRATION
// ==================================================

Injectable()(CRMDemoService);

export {
  DemoConfig,
  CRMDemoService
};
