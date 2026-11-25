import { CRMDemoService } from './crm-demo.mjs';

const demo = new CRMDemoService();

try {
  await demo.runDemo();
} catch {
  process.exitCode = 1;
}