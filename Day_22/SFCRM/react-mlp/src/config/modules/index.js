
import { leadsConfig } from "./leads.config";
import { contactsConfig } from "./contacts.config";
import { accountsConfig } from "./accounts.config";
import { opportunitiesConfig } from "./opportunities.config";
import { tasksConfig } from "./tasks.config";
import { casesConfig } from "./cases.config";

export const crmModules = {
  leads: leadsConfig,
  contacts: contactsConfig,
  accounts: accountsConfig,
  opportunities: opportunitiesConfig,
  tasks: tasksConfig,
  cases: casesConfig
};

export function getCRMModule(moduleName) {
  return crmModules[moduleName] || null;
}

export function getAllCRMModules() {
  return Object.values(crmModules);
}

export function getCRMModuleNames() {
  return Object.keys(crmModules);
}
