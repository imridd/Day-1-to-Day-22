import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'crm-enterprise-test-'));
process.env.CRM_DB_PATH=join(dir,'crm.json');
process.env.NODE_ENV='test';
const {server}=await import('../server/server.mjs');
let base;
before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`});
after(async()=>{await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true})});
async function call(path,{method='GET',body,user='u1'}={}){
 const r=await fetch(base+'/api'+path,{method,headers:{'content-type':'application/json','x-demo-user':user},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};
}
beforeEach(async()=>{if(base){const x=await call('/reset',{method:'POST'});assert.equal(x.status,200)}});
test('health and seed object counts',async()=>{const res=await call('/health');assert.equal(res.status,200);assert.equal(res.data.objects.contacts,5);assert.equal(res.data.objects.leads,6)});
test('lead conversion requires qualification and creates linked records and task',async()=>{
 const lead=await call('/leads',{method:'POST',body:{FirstName:'Isha',LastName:'Patil',Company:'Delta Robotics',Email:'isha@example.com'}});assert.equal(lead.status,201);
 const err=await call(`/leads/${lead.data.Id}/convert`,{method:'POST',body:{}});assert.equal(err.status,400);
 await call(`/leads/${lead.data.Id}`,{method:'PATCH',body:{Status:'Qualified'}});
 const convert=await call(`/leads/${lead.data.Id}/convert`,{method:'POST',body:{createOpportunity:true}});
 assert.equal(convert.status,200);assert.equal(convert.data.Lead.Status,'Converted');assert.equal(convert.data.Contact.AccountId,convert.data.Account.Id);
 assert.equal(convert.data.Opportunity.AccountId,convert.data.Account.Id);
 const tasks=await call('/tasks');assert.ok(tasks.data.some(t=>t.Subject.includes('Welcome call')));
 const flows=await call('/workflows');assert.ok(flows.data.runs.some(r=>r.name==='Lead qualification follow-up'));
});
test('contact validation prevents bad email and duplicate contact',async()=>{
 const bad=await call('/contacts',{method:'POST',body:{LastName:'Patel',Email:'bad-at-example'}});assert.equal(bad.status,400);assert.match(bad.data.error,/email/i);
 const dup=await call('/contacts',{method:'POST',body:{LastName:'Rao',Email:'ananya@example.com'}});assert.equal(dup.status,400);assert.match(dup.data.error,/Duplicate/i);
});
test('role and record and field restrictions are enforced on server',async()=>{
 const noLeads=await call('/leads',{user:'u4'});assert.equal(noLeads.status,403);
 const repAccounts=await call('/accounts',{user:'u2'});assert.equal(repAccounts.status,200);assert.ok(!('AnnualRevenue' in repAccounts.data[0]));
 const adminAccounts=await call('/accounts');assert.ok('AnnualRevenue' in adminAccounts.data[0]);
 const managerLead='00Q000000000000004';const change=await call('/leads/'+managerLead,{method:'PATCH',user:'u2',body:{Status:'Working'}});assert.equal(change.status,403);
});
test('High-priority Case automatically escalates and creates task',async()=>{
 const c=await call('/cases',{method:'POST',user:'u4',body:{Subject:'Urgent connectivity issue',Priority:'Critical',Status:'New'}});assert.equal(c.status,201);
 const tasks=await call('/tasks',{user:'u4'});assert.ok(tasks.data.some(x=>x.RelatedToId===c.data.Id && x.Subject.includes('Escalate case')));
 const runs=await call('/workflows');assert.ok(runs.data.runs.some(x=>x.triggerId===c.data.Id));
});
test('Opportunity Closed Won produces onboarding task',async()=>{
 const id='006000000000000001';const changed=await call(`/opportunities/${id}`,{method:'PATCH',body:{StageName:'Closed Won'}});assert.equal(changed.data.Probability,100);
 const tasks=await call('/tasks');assert.ok(tasks.data.some(x=>x.RelatedToId===id&&x.Subject.startsWith('Begin onboarding')));
});
test('relationship restrictions prevent account deletion',async()=>{
 const r=await call('/accounts/001000000000000001',{method:'DELETE'});assert.equal(r.status,400);assert.match(r.data.error,/related records/i);
});
test('GraphQL selection sets return edges node value and count',async()=>{
 const query=`query Contacts {uiapi {query {Contact(first: 2) {totalCount edges {node {Id LastName {value} Email {value}}}}}}}`;
 const res=await call('/graphql',{method:'POST',body:{query}});
 assert.equal(res.status,200);assert.equal(res.data.data.uiapi.query.Contact.totalCount,5);
 assert.equal(res.data.data.uiapi.query.Contact.edges.length,2);
 assert.ok(typeof res.data.data.uiapi.query.Contact.edges[0].node.LastName.value==='string');
 assert.ok(!('Phone' in res.data.data.uiapi.query.Contact.edges[0].node));
});
test('GraphQL mutation with variables creates a Contact',async()=>{
 const query=`mutation CreateContact($input: ContactCreateInput!) {uiapi {ContactCreate(input:$input){Record{Id FirstName{value} LastName{value}} success}}}`;
 const res=await call('/graphql',{method:'POST',body:{query,variables:{input:{Contact:{FirstName:'Dev',LastName:'Trainer',Email:'trainer@example.com'}}}}});
 assert.equal(res.data.data.uiapi.ContactCreate.Record.LastName.value,'Trainer');
 assert.equal(res.data.data.uiapi.ContactCreate.success,true);
});
test('GraphQL field security reports errors rather than exposing annual revenue',async()=>{
 const query=`query A{uiapi{query{Account(first:3){edges{node{Id Name{value} AnnualRevenue{value}}}}}}}`;
 const res=await call('/graphql',{method:'POST',user:'u2',body:{query}});
 assert.equal(res.data.data,null);assert.match(res.data.errors[0].message,/Field-level security/);
});
test('audit limited to managers and administrators',async()=>{
 const unauthorized=await call('/audit',{user:'u2'});assert.equal(unauthorized.status,403);
 await call('/leads',{method:'POST',body:{LastName:'Test',Company:'Example Inc'}});
 const authorized=await call('/audit');assert.ok(authorized.data.find(x=>x.operation==='CREATE'));
});
