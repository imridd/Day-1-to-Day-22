import {existsSync,readFileSync,writeFileSync,renameSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {OBJECTS,USERS,ROLE_PERMISSIONS,STAGE_PROBABILITIES,WORKFLOWS} from './model.mjs';
import {seed} from './seed.mjs';

const dbPath = resolve(process.env.CRM_DB_PATH||'server/data/crm.json');
let db;
function persist(){mkdirSync(dirname(dbPath),{recursive:true});const tmp=dbPath+'.tmp';writeFileSync(tmp,JSON.stringify(db,null,2),'utf8');renameSync(tmp,dbPath);}
function load(){if(!db){db=existsSync(dbPath)?JSON.parse(readFileSync(dbPath,'utf8')):seed();persist();}return db;}
export class CRMError extends Error {constructor(message,status=400){super(message);this.status=status;}}
const err=(message,status=400)=>{throw new CRMError(message,status);};
export const userById=id=>USERS.find(x=>x.Id===id);
export function currentUser(id){const user=userById(id);if(!user)err('Unknown classroom persona',400);return user;}
export function can(user,obj,verb){return !!ROLE_PERMISSIONS[user.Role]?.[obj]?.includes(verb);}
export function checkObject(user,obj,verb){if(!OBJECTS[obj])err('Unknown Salesforce-style object: '+obj,404);if(!can(user,obj,verb))err(`${user.Role} does not have ${verb} permission on ${OBJECTS[obj].singular}`,403);}
function checkOwner(user,obj,row,verb){
  if(user.Role==='Administrator'||user.Role==='Sales Manager')return;
  if(user.Role==='Sales Representative') {
    if((obj==='leads'||obj==='opportunities')&&row.OwnerId!==user.Id)err('Record sharing: this record is not owned by you',403);
    if(verb!=='R'&&row.OwnerId!==user.Id)err('Record edit access denied: another owner',403);
  }
  if(user.Role==='Support Agent'&&obj==='cases'&&row.OwnerId!==user.Id)err('Case queue sharing denied',403);
  if(user.Role==='Support Agent'&&obj==='tasks'&&verb!=='R'&&row.OwnerId!==user.Id)err('Task ownership restriction',403);
}
function visible(user,obj,row){try{checkOwner(user,obj,row,'R');return true;}catch{return false;}}
const HIDDEN_FIELDS={'Sales Representative':{accounts:['AnnualRevenue']},'Support Agent':{accounts:['AnnualRevenue']}};
export function fieldAllowed(user,obj,field){return !(HIDDEN_FIELDS[user.Role]?.[obj]||[]).includes(field);}
export function sanitize(user,obj,row){if(!row)return null;let out={};for(const [k,v] of Object.entries(row))if(fieldAllowed(user,obj,k))out[k]=v;return out;}
export function getAll(user,obj,opts={}){
  load();checkObject(user,obj,'R');
  let a=db[obj].filter(r=>visible(user,obj,r)).map(r=>sanitize(user,obj,r));
  const q=String(opts.q||'').trim().toLowerCase();
  if(q)a=a.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));
  const sort=opts.sort||'LastModifiedDate';
  const direction=opts.dir==='asc'?1:-1;
  if(a.length&&Object.hasOwn(a[0],sort))a.sort((x,y)=>String(x[sort]??'').localeCompare(String(y[sort]??''))*direction);
  return a;
}
export function getOne(user,obj,id){load();checkObject(user,obj,'R');const r=db[obj].find(x=>x.Id===id);if(!r)err('Record not found',404);checkOwner(user,obj,r,'R');return sanitize(user,obj,r);}
function stamp(){return new Date().toISOString();}
function addId(obj){return OBJECTS[obj].prefix+randomBytes(8).toString('hex').slice(0,15).toUpperCase();}
function defaults(obj,x){
 const d={leads:{Status:'New',Rating:'Warm',LeadSource:'Website'}, opportunities:{StageName:'Prospecting',Amount:0},cases:{Status:'New',Priority:'Medium',Origin:'Web'},tasks:{Status:'Not Started',Priority:'Normal'}}[obj]||{};
 return {...d,...x};
}
function validate(user,obj,input,existing={}){
 const model=OBJECTS[obj];if(!model)err('Unknown object',404);
 const allowed=Object.keys(model.fields);const value={};
 for(const [k,v] of Object.entries(input||{})){
   if(k==='Id'||k==='CreatedDate'||k==='LastModifiedDate'||k==='CaseNumber'||k==='ConvertedAccountId'||k==='ConvertedContactId'||k==='ConvertedOpportunityId')err(`${k} is a system-managed field`,400);
   if(!allowed.includes(k))err(`Invalid field ${k} on ${model.singular}`,400);
   if(!fieldAllowed(user,obj,k))err(`Field-level security: ${k} is not writable`,403);
   if(k==='OwnerId' && user.Role!=='Administrator' && user.Role!=='Sales Manager' && v!==user.Id)err('Only managers can assign records to another user',403);
   value[k]=(typeof v==='string')?v.trim():v;
 }
 const r={...defaults(obj,{}),...existing,...value};
 for(const [k,meta] of Object.entries(model.fields)){
   if(meta.required&&(r[k]===undefined||r[k]===null||String(r[k]).trim()===''))err(`${meta.label} is required`);
   if(meta.type==='select'&&r[k]!==undefined&&r[k]!==''&&!meta.options.includes(r[k]))err(`Invalid ${k}: must be ${meta.options.join(', ')}`);
   if((meta.type==='money'||meta.type==='number')&&r[k]!==undefined&&r[k]!==null&&r[k]!==''){
     const n=Number(r[k]);if(!Number.isFinite(n)||n<0)err(`${meta.label} must be a non-negative number`);r[k]=n;value[k]=n;
   }
   if(meta.type==='email'&&r[k]&& !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r[k]))err(`Invalid email address for ${k}`);
   if(meta.type==='date'&&r[k]&&!/^\d{4}-\d{2}-\d{2}$/.test(r[k]))err(`Invalid ${k}; use YYYY-MM-DD`);
 }
 if(obj==='opportunities'){
   if('StageName' in value || !existing.Id){value.Probability=STAGE_PROBABILITIES[r.StageName]??10;}
 }
 if(obj==='leads'&&value.Status==='Converted'&&existing.Status!=='Converted')err('Use the Convert Lead action instead of setting Converted manually');
 if(obj==='leads'&&existing.Status==='Converted'&&value.Status!==undefined&&value.Status!=='Converted')err('Converted leads cannot return to an open status');
 for(const [name,target] of [['AccountId','accounts'],['ContactId','contacts']]){
   if(r[name] && model.fields[name] && !db[target].some(x=>x.Id===r[name]))err(`${name} references a nonexistent record`);
 }
 if(obj==='contacts'){
   const duplicate=db.contacts.some(x=>x.Email&&r.Email&&x.Email.toLowerCase()===r.Email.toLowerCase()&&x.Id!==existing.Id);
   if(duplicate)err('Duplicate rule: a contact with this email already exists');
 }
 return value;
}
function audit(user,obj,operation,row,details=''){
 db.audit.unshift({id:randomBytes(5).toString('hex'),at:stamp(),actorId:user.Id,actorName:user.Name,object:obj,operation,recordId:row?.Id||'',label:row?.Name||row?.Subject||[row?.FirstName,row?.LastName].filter(Boolean).join(' '),details});
 db.audit=db.audit.slice(0,400);
}
function taskFromFlow(ownerId,Subject,RelatedToId,priority='Normal',days=3){
 const row={Id:addId('tasks'),CreatedDate:stamp(),LastModifiedDate:stamp(),OwnerId:ownerId,Subject,Status:'Not Started',Priority:priority,ActivityDate:new Date(Date.now()+days*86400000).toISOString().slice(0,10),RelatedToId};
 db.tasks.unshift(row);return row;
}
function flow(name,triggerId,actionDescription){db.workflowRuns.unshift({Id:randomBytes(7).toString('hex'),name,triggerId,actionDescription,at:stamp()});db.workflowRuns=db.workflowRuns.slice(0,100);}
function fireFlow(user,obj,operation,row,previous){
 if(obj==='opportunities'&&operation==='CREATE'){
  taskFromFlow(row.OwnerId,'Follow up: '+row.Name,row.Id,'Normal',3);
  flow('New opportunity follow-up',row.Id,'Created a follow-up task automatically');
 }
 if(obj==='opportunities'&&row.StageName==='Closed Won'&&previous?.StageName!=='Closed Won'){
  taskFromFlow(row.OwnerId,'Begin onboarding: '+row.Name,row.Id,'High',1);
  flow('Closed Won onboarding',row.Id,'Created a customer onboarding task');
 }
 if(obj==='cases'&&['High','Critical'].includes(row.Priority)&&(!previous||!['High','Critical'].includes(previous.Priority))){
  taskFromFlow(row.OwnerId,'Escalate case: '+row.Subject,row.Id,'High',0);
  flow('High-priority case escalation',row.Id,'Created an urgent support task');
 }
}
export function create(user,obj,input){load();checkObject(user,obj,'C');const values=validate(user,obj,{...input,OwnerId:input?.OwnerId||user.Id});const row={Id:addId(obj),CreatedDate:stamp(),LastModifiedDate:stamp(),...defaults(obj,values)};
 if(obj==='cases')row.CaseNumber=String(100000+db.cases.length+1);
 db[obj].unshift(row);audit(user,obj,'CREATE',row);fireFlow(user,obj,'CREATE',row);persist();return sanitize(user,obj,row);
}
export function update(user,obj,id,input){load();checkObject(user,obj,'U');const row=db[obj].find(x=>x.Id===id);if(!row)err('Record not found',404);checkOwner(user,obj,row,'U');const previous={...row};const values=validate(user,obj,input,row);Object.assign(row,values,{LastModifiedDate:stamp()});audit(user,obj,'UPDATE',row,'Fields: '+Object.keys(values).join(', '));fireFlow(user,obj,'UPDATE',row,previous);persist();return sanitize(user,obj,row);}
export function remove(user,obj,id){load();checkObject(user,obj,'D');const index=db[obj].findIndex(x=>x.Id===id);if(index<0)err('Record not found',404);const row=db[obj][index];checkOwner(user,obj,row,'D');
 if(obj==='accounts' && ['contacts','opportunities','cases'].some(t=>db[t].some(x=>x.AccountId===id)))err('Relationship rule: cannot delete an Account with related records');
 if(obj==='contacts'&&db.cases.some(x=>x.ContactId===id))err('Relationship rule: cannot delete a Contact linked to Cases');
 db[obj].splice(index,1);audit(user,obj,'DELETE',row);persist();return {success:true,deletedId:id};}
export function convertLead(user,id,{createOpportunity=true}={}){
 load();checkObject(user,'leads','U');checkObject(user,'accounts','C');checkObject(user,'contacts','C');if(createOpportunity)checkObject(user,'opportunities','C');
 const lead=db.leads.find(x=>x.Id===id);if(!lead)err('Lead not found',404);checkOwner(user,'leads',lead,'U');if(lead.Status==='Converted')err('Lead has already been converted');
 if(lead.Status!=='Qualified')err('Lead must be Qualified before conversion');
 const account=db.accounts.find(a=>a.Name.toLowerCase()===lead.Company.toLowerCase())||createInternal('accounts',lead.OwnerId,{Name:lead.Company,Industry:lead.Industry||'Other'});
 const contact=createInternal('contacts',lead.OwnerId,{FirstName:lead.FirstName||'',LastName:lead.LastName,Email:lead.Email||'',Phone:lead.Phone||'',AccountId:account.Id});
 let opportunity=null;
 if(createOpportunity)opportunity=createInternal('opportunities',lead.OwnerId,{Name:lead.Company+' – Initial Opportunity',AccountId:account.Id,StageName:'Qualification',Amount:0,CloseDate:new Date(Date.now()+30*86400000).toISOString().slice(0,10),Probability:25});
 Object.assign(lead,{Status:'Converted',ConvertedAccountId:account.Id,ConvertedContactId:contact.Id,ConvertedOpportunityId:opportunity?.Id||null,LastModifiedDate:stamp()});
 audit(user,'leads','CONVERT',lead,`Account ${account.Id}; Contact ${contact.Id}; Opportunity ${opportunity?.Id||'none'}`);
 taskFromFlow(lead.OwnerId,`Welcome call: ${lead.FirstName||''} ${lead.LastName}`,contact.Id,'Normal',1);
 flow('Lead qualification follow-up',lead.Id,'Created Account, Contact'+(opportunity?', Opportunity':'')+' and welcome-call task');
 persist();return {Lead:sanitize(user,'leads',lead),Account:sanitize(user,'accounts',account),Contact:sanitize(user,'contacts',contact),Opportunity:opportunity?sanitize(user,'opportunities',opportunity):null};
}
function createInternal(obj,OwnerId,values){const row={Id:addId(obj),OwnerId,CreatedDate:stamp(),LastModifiedDate:stamp(),...values};db[obj].unshift(row);return row;}
export function stats(user){load();const all={};for(const obj of Object.keys(OBJECTS))all[obj]=can(user,obj,'R')?getAll(user,obj):[];
 const active=all.opportunities.filter(x=>!['Closed Won','Closed Lost'].includes(x.StageName));
 const pipeline=active.reduce((sum,o)=>sum+Number(o.Amount||0),0);
 const weighted=active.reduce((sum,o)=>sum+Number(o.Amount||0)*Number(o.Probability||0)/100,0);
 const won=all.opportunities.filter(x=>x.StageName==='Closed Won').reduce((sum,o)=>sum+Number(o.Amount||0),0);
 const breakdown=Object.keys(STAGE_PROBABILITIES).map(stage=>({stage,count:all.opportunities.filter(x=>x.StageName===stage).length,amount:all.opportunities.filter(x=>x.StageName===stage).reduce((sum,o)=>sum+Number(o.Amount||0),0)}));
 return {totalLeads:all.leads.length,unconvertedLeads:all.leads.filter(x=>x.Status!=='Converted').length,totalAccounts:all.accounts.length,totalContacts:all.contacts.length,openCases:all.cases.filter(x=>x.Status!=='Closed').length,overdueTasks:all.tasks.filter(x=>x.Status!=='Completed'&&x.ActivityDate<new Date().toISOString().slice(0,10)).length,pipeline,weighted,won,breakdown,recentActivities:db.audit.slice(0,7),recentFlows:db.workflowRuns.slice(0,6)};
}
export function getAudit(user){load();if(!['Administrator','Sales Manager'].includes(user.Role))err('Only managers and administrators can inspect audit history',403);return db.audit;}
export function getFlows(user){load();return {definitions:WORKFLOWS,runs:['Administrator','Sales Manager'].includes(user.Role)?db.workflowRuns:db.workflowRuns.slice(0,10)};}
export function getSecurity(user){return {user,roles:USERS,permissions:ROLE_PERMISSIONS[user.Role],allPermissions:ROLE_PERMISSIONS,hiddenFields:HIDDEN_FIELDS[user.Role]||{},notes:'ROLE SIMULATION ONLY: x-demo-user is a trusted classroom selector, NOT real authentication.'};}
export function getMeta(){return {objects:OBJECTS,users:USERS,stages:STAGE_PROBABILITIES};}
export function reset(user){if(user.Role!=='Administrator')err('Administrator role required for reset',403);db=seed();persist();return {success:true,message:'Sample CRM data restored'};}
export function dbHealth(){load();return {status:'ok',storage:dbPath,objects:Object.fromEntries(Object.keys(OBJECTS).map(k=>[k,db[k].length]))};}
