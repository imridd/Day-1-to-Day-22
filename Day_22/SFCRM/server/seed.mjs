
import { Injectable } from '@nestjs/common';

// --------------------------------------------------
// DATE UTILITIES
// --------------------------------------------------

class SeedDateUtils {
  static dateOffset(days) {
    return new Date(
      Date.now() + days * 86400000
    )
      .toISOString()
      .slice(0, 10);
  }

  static getTimestamp() {
    return '2026-11-01T09:00:00.000Z';
  }
}

// --------------------------------------------------
// SEED SERVICE
// --------------------------------------------------

class SeedService {
  constructor() {
    this.stamp = SeedDateUtils.getTimestamp();

    this.base = {
      CreatedDate: this.stamp,
      LastModifiedDate: this.stamp
    };
  }

  // ------------------------------------------------
  // COMMON RECORD BUILDER
  // ------------------------------------------------

  createRecord(Id, OwnerId, fields) {
    return {
      ...this.base,
      Id,
      OwnerId,
      ...fields
    };
  }

  // ------------------------------------------------
  // ACCOUNT SEED DATA
  // ------------------------------------------------

  getAccounts() {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('001000000000000001', 'u2', {
        Name: 'Aurora Technologies',
        Industry: 'Technology',
        BillingCity: 'Hyderabad',
        Website: 'https://aurora.example.com',
        Phone: '555-1001',
        AnnualRevenue: 7500000
      }),

      r('001000000000000002', 'u2', {
        Name: 'BluePeak Analytics',
        Industry: 'Analytics',
        BillingCity: 'Bengaluru',
        Website: 'https://bluepeak.example.com',
        Phone: '555-1002',
        AnnualRevenue: 4500000
      }),

      r('001000000000000003', 'u3', {
        Name: 'Evergreen Health',
        Industry: 'Healthcare',
        BillingCity: 'Chennai',
        Website: 'https://evergreen.example.com',
        Phone: '555-1003',
        AnnualRevenue: 12000000
      }),

      r('001000000000000004', 'u3', {
        Name: 'Nimbus Education',
        Industry: 'Education',
        BillingCity: 'Pune',
        Website: 'https://nimbus.example.com',
        Phone: '555-1004',
        AnnualRevenue: 2800000
      })
    ];
  }

  // ------------------------------------------------
  // CONTACT SEED DATA
  // ------------------------------------------------

  getContacts(accounts) {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('003000000000000001', 'u2', {
        FirstName: 'Ananya',
        LastName: 'Rao',
        Email: 'ananya@example.com',
        Phone: '555-0101',
        Title: 'CTO',
        AccountId: accounts[0].Id
      }),

      r('003000000000000002', 'u2', {
        FirstName: 'Ravi',
        LastName: 'Kumar',
        Email: 'ravi@example.com',
        Phone: '555-0102',
        Title: 'Procurement Lead',
        AccountId: accounts[1].Id
      }),

      r('003000000000000003', 'u3', {
        FirstName: 'Meera',
        LastName: 'Sharma',
        Email: 'meera@example.com',
        Phone: '555-0103',
        Title: 'Operations Director',
        AccountId: accounts[2].Id
      }),

      r('003000000000000004', 'u3', {
        FirstName: 'Tarun',
        LastName: 'Nair',
        Email: 'tarun@example.com',
        Phone: '555-0104',
        Title: 'Learning Director',
        AccountId: accounts[3].Id
      }),

      r('003000000000000005', 'u2', {
        FirstName: 'Sara',
        LastName: 'Iyer',
        Email: 'sara@example.com',
        Phone: '555-0105',
        Title: 'Engineering Manager',
        AccountId: accounts[0].Id
      })
    ];
  }

  // ------------------------------------------------
  // LEAD SEED DATA
  // ------------------------------------------------

  getLeads() {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('00Q000000000000001', 'u2', {
        FirstName: 'Kavya',
        LastName: 'Menon',
        Company: 'Skyline Labs',
        Email: 'kavya@example.com',
        Phone: '555-0201',
        Status: 'New',
        LeadSource: 'Website',
        Rating: 'Hot',
        Industry: 'Technology'
      }),

      r('00Q000000000000002', 'u2', {
        FirstName: 'Ayaan',
        LastName: 'Khan',
        Company: 'Mercury Retail',
        Email: 'ayaan@example.com',
        Phone: '555-0202',
        Status: 'Working',
        LeadSource: 'Webinar',
        Rating: 'Warm',
        Industry: 'Retail'
      }),

      r('00Q000000000000003', 'u2', {
        FirstName: 'Nisha',
        LastName: 'Verma',
        Company: 'Crest Finance',
        Email: 'nisha@example.com',
        Phone: '555-0203',
        Status: 'Qualified',
        LeadSource: 'Referral',
        Rating: 'Hot',
        Industry: 'Finance'
      }),

      r('00Q000000000000004', 'u3', {
        FirstName: 'Rohan',
        LastName: 'Das',
        Company: 'Oakridge Manufacturing',
        Email: 'rohan@example.com',
        Phone: '555-0204',
        Status: 'New',
        LeadSource: 'Outbound',
        Rating: 'Cold',
        Industry: 'Manufacturing'
      }),

      r('00Q000000000000005', 'u3', {
        FirstName: 'Leela',
        LastName: 'Patel',
        Company: 'Horizon Travel',
        Email: 'leela@example.com',
        Phone: '555-0205',
        Status: 'Working',
        LeadSource: 'Partner',
        Rating: 'Warm',
        Industry: 'Travel'
      }),

      r('00Q000000000000006', 'u3', {
        FirstName: 'Kabir',
        LastName: 'Seth',
        Company: 'Prism Design',
        Email: 'kabir@example.com',
        Phone: '555-0206',
        Status: 'Unqualified',
        LeadSource: 'Website',
        Rating: 'Cold',
        Industry: 'Services'
      })
    ];
  }

  // ------------------------------------------------
  // OPPORTUNITY SEED DATA
  // ------------------------------------------------

  getOpportunities(accounts) {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('006000000000000001', 'u2', {
        Name: 'Aurora Enterprise Platform',
        AccountId: accounts[0].Id,
        StageName: 'Proposal',
        Amount: 250000,
        CloseDate: SeedDateUtils.dateOffset(22),
        Probability: 50
      }),

      r('006000000000000002', 'u2', {
        Name: 'BluePeak Data Modernization',
        AccountId: accounts[1].Id,
        StageName: 'Negotiation',
        Amount: 180000,
        CloseDate: SeedDateUtils.dateOffset(12),
        Probability: 75
      }),

      r('006000000000000003', 'u3', {
        Name: 'Evergreen Patient Portal',
        AccountId: accounts[2].Id,
        StageName: 'Qualification',
        Amount: 320000,
        CloseDate: SeedDateUtils.dateOffset(38),
        Probability: 25
      }),

      r('006000000000000004', 'u3', {
        Name: 'Nimbus Learning Platform',
        AccountId: accounts[3].Id,
        StageName: 'Closed Won',
        Amount: 90000,
        CloseDate: SeedDateUtils.dateOffset(-12),
        Probability: 100
      }),

      r('006000000000000005', 'u2', {
        Name: 'Aurora AI Pilot',
        AccountId: accounts[0].Id,
        StageName: 'Prospecting',
        Amount: 75000,
        CloseDate: SeedDateUtils.dateOffset(55),
        Probability: 10
      }),

      r('006000000000000006', 'u3', {
        Name: 'Evergreen Services Renewal',
        AccountId: accounts[2].Id,
        StageName: 'Closed Lost',
        Amount: 110000,
        CloseDate: SeedDateUtils.dateOffset(-5),
        Probability: 0
      })
    ];
  }

  // ------------------------------------------------
  // CASE SEED DATA
  // ------------------------------------------------

  getCases(accounts, contacts) {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('500000000000000001', 'u4', {
        CaseNumber: '000101',
        Subject: 'Unable to access the customer portal',
        Description: 'User receives an authorization error',
        AccountId: accounts[0].Id,
        ContactId: contacts[0].Id,
        Status: 'Working',
        Priority: 'High',
        Origin: 'Web'
      }),

      r('500000000000000002', 'u4', {
        CaseNumber: '000102',
        Subject: 'Invoice mismatch',
        Description: 'Invoice total differs from the quote',
        AccountId: accounts[1].Id,
        ContactId: contacts[1].Id,
        Status: 'New',
        Priority: 'Medium',
        Origin: 'Email'
      }),

      r('500000000000000003', 'u4', {
        CaseNumber: '000103',
        Subject: 'API rate limit alert',
        Description: 'Integration exceeds configured API throughput',
        AccountId: accounts[2].Id,
        ContactId: contacts[2].Id,
        Status: 'Escalated',
        Priority: 'Critical',
        Origin: 'Phone'
      }),

      r('500000000000000004', 'u4', {
        CaseNumber: '000104',
        Subject: 'Training completion certificate',
        Description: 'Need an updated completion certificate',
        AccountId: accounts[3].Id,
        ContactId: contacts[3].Id,
        Status: 'Closed',
        Priority: 'Low',
        Origin: 'Chat'
      }),

      r('500000000000000005', 'u4', {
        CaseNumber: '000105',
        Subject: 'New user onboarding question',
        Description: 'Need instructions for onboarding',
        AccountId: accounts[0].Id,
        ContactId: contacts[4].Id,
        Status: 'New',
        Priority: 'Medium',
        Origin: 'Web'
      })
    ];
  }

  // ------------------------------------------------
  // TASK SEED DATA
  // ------------------------------------------------

  getTasks(opportunities, cases) {
    const r = (Id, OwnerId, fields) =>
      this.createRecord(Id, OwnerId, fields);

    return [
      r('00T000000000000001', 'u2', {
        Subject: 'Call Aurora CTO about proposal',
        Status: 'In Progress',
        Priority: 'High',
        ActivityDate: SeedDateUtils.dateOffset(1),
        RelatedToId: opportunities[0].Id
      }),

      r('00T000000000000002', 'u2', {
        Subject: 'Review BluePeak pricing',
        Status: 'Not Started',
        Priority: 'Normal',
        ActivityDate: SeedDateUtils.dateOffset(3),
        RelatedToId: opportunities[1].Id
      }),

      r('00T000000000000003', 'u3', {
        Subject: 'Prepare Evergreen requirements',
        Status: 'In Progress',
        Priority: 'Normal',
        ActivityDate: SeedDateUtils.dateOffset(4),
        RelatedToId: opportunities[2].Id
      }),

      r('00T000000000000004', 'u4', {
        Subject: 'Investigate critical API case',
        Status: 'In Progress',
        Priority: 'High',
        ActivityDate: SeedDateUtils.dateOffset(0),
        RelatedToId: cases[2].Id
      }),

      r('00T000000000000005', 'u4', {
        Subject: 'Respond to invoice query',
        Status: 'Not Started',
        Priority: 'Normal',
        ActivityDate: SeedDateUtils.dateOffset(1),
        RelatedToId: cases[1].Id
      })
    ];
  }

  // ------------------------------------------------
  // BUILD COMPLETE SEED DATA
  // ------------------------------------------------

  seed() {
    const accounts = this.getAccounts();
    const contacts = this.getContacts(accounts);
    const leads = this.getLeads();
    const opportunities = this.getOpportunities(accounts);
    const cases = this.getCases(accounts, contacts);
    const tasks = this.getTasks(opportunities, cases);

    return {
      accounts,
      contacts,
      leads,
      opportunities,
      cases,
      tasks,
      audit: [],
      workflowRuns: [],
      lastResetAt: new Date().toISOString()
    };
  }
}

// Apply NestJS decorator programmatically.
Injectable()(SeedService);

export { SeedService };

// --------------------------------------------------
// OPTIONAL FUNCTION EXPORT FOR LEGACY COMPATIBILITY
// --------------------------------------------------

const seedService = new SeedService();

export function seed() {
  return seedService.seed();
}
