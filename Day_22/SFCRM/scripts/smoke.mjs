
import {
  Injectable
} from '@nestjs/common';

// ==================================================
// CONFIGURATION
// ==================================================

class ApiTestConfig {

  constructor() {
    this.baseUrl =
      process.env.API_BASE || 'http://127.0.0.1:4100';

    this.tests = [
      {
        name: 'Health',
        path: '/api/health'
      },
      {
        name: 'Objects',
        path: '/api/metadata'
      },
      {
        name: 'Dashboard',
        path: '/api/overview'
      },
      {
        name: 'Leads',
        path: '/api/leads'
      },
      {
        name: 'Contacts',
        path: '/api/contacts'
      },
      {
        name: 'Flows',
        path: '/api/workflows'
      }
    ];
  }

}

// ==================================================
// API TEST SERVICE
// ==================================================

class ApiTestService {

  constructor() {
    this.config = new ApiTestConfig();
  }

  // ----------------------------------------------
  // TEST SINGLE API
  // ----------------------------------------------

  async testEndpoint(test) {
    try {
      const response = await fetch(
        `${this.config.baseUrl}${test.path}`
      );

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error('Response is not valid JSON');
      }

      if (!response.ok) {
        throw new Error(
          result.error || String(response.status)
        );
      }

      console.log('PASS', test.name);

      return {
        name: test.name,
        status: 'PASS'
      };

    } catch (error) {

      console.log('FAIL', test.name, error.message);

      return {
        name: test.name,
        status: 'FAIL',
        error: error.message
      };

    }
  }

  // ----------------------------------------------
  // RUN ALL API TESTS
  // ----------------------------------------------

  async runTests() {
    console.log('\nStarting CRM API tests...\n');

    const results = [];

    for (const test of this.config.tests) {
      const result = await this.testEndpoint(test);

      results.push(result);
    }

    const failed = results.filter(
      result => result.status === 'FAIL'
    );

    const passed = results.filter(
      result => result.status === 'PASS'
    );

    console.log('\n------------------------------');
    console.log('CRM API TEST SUMMARY');
    console.log('------------------------------');

    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);

    console.log('------------------------------\n');

    return {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      results
    };
  }

}

// ==================================================
// NESTJS DECORATOR REGISTRATION
// ==================================================

Injectable()(ApiTestService);

export {
  ApiTestConfig,
  ApiTestService
};
