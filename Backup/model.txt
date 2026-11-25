export const USERS = [
  {Id:'u1',Name:'Morgan Admin',Role:'Administrator',Initials:'MA',Color:'#7367e8'},
  {Id:'u2',Name:'Riya Sales',Role:'Sales Representative',Initials:'RS',Color:'#1583bb'},
  {Id:'u3',Name:'Daniel Manager',Role:'Sales Manager',Initials:'DM',Color:'#b36e17'},
  {Id:'u4',Name:'Sam Support',Role:'Support Agent',Initials:'SS',Color:'#15957e'}
];
export const OBJECTS = {
  leads:{prefix:'00Q',singular:'Lead',label:'Leads',description:'Unqualified prospects captured before conversion',fields:{FirstName:{label:'First name',type:'text'},LastName:{label:'Last name',type:'text',required:true},Company:{label:'Company',type:'text',required:true},Email:{label:'Email',type:'email'},Phone:{label:'Phone',type:'tel'},Status:{label:'Lead status',type:'select',options:['New','Working','Qualified','Unqualified','Converted']},LeadSource:{label:'Lead source',type:'select',options:['Website','Referral','Webinar','Partner','Outbound']},Rating:{label:'Rating',type:'select',options:['Hot','Warm','Cold']},Industry:{label:'Industry',type:'text'},OwnerId:{label:'Owner',type:'user'}}},
  accounts:{prefix:'001',singular:'Account',label:'Accounts',description:'Companies and organizations that you work with',fields:{Name:{label:'Account name',type:'text',required:true},Industry:{label:'Industry',type:'text'},Website:{label:'Website',type:'text'},Phone:{label:'Phone',type:'tel'},AnnualRevenue:{label:'Annual revenue',type:'money'},BillingCity:{label:'Billing city',type:'text'},OwnerId:{label:'Owner',type:'user'}}},
  contacts:{prefix:'003',singular:'Contact',label:'Contacts',description:'People associated with accounts',fields:{FirstName:{label:'First name',type:'text'},LastName:{label:'Last name',type:'text',required:true},Email:{label:'Email',type:'email'},Phone:{label:'Phone',type:'tel'},Title:{label:'Job title',type:'text'},AccountId:{label:'Account',type:'account'},OwnerId:{label:'Owner',type:'user'}}},
  opportunities:{prefix:'006',singular:'Opportunity',label:'Opportunities',description:'Potential revenue tracked through a sales pipeline',fields:{Name:{label:'Opportunity name',type:'text',required:true},AccountId:{label:'Account',type:'account',required:true},StageName:{label:'Stage',type:'select',options:['Prospecting','Qualification','Proposal','Negotiation','Closed Won','Closed Lost']},Amount:{label:'Amount',type:'money'},CloseDate:{label:'Close date',type:'date',required:true},Probability:{label:'Probability (%)',type:'number'},OwnerId:{label:'Owner',type:'user'}}},
  cases:{prefix:'500',singular:'Case',label:'Cases',description:'Customer service issues tracked to resolution',fields:{Subject:{label:'Subject',type:'text',required:true},Description:{label:'Description',type:'textarea'},AccountId:{label:'Account',type:'account'},ContactId:{label:'Contact',type:'contact'},Status:{label:'Status',type:'select',options:['New','Working','Escalated','Closed']},Priority:{label:'Priority',type:'select',options:['Low','Medium','High','Critical']},Origin:{label:'Origin',type:'select',options:['Phone','Email','Web','Chat']},OwnerId:{label:'Owner',type:'user'}}},
  tasks:{prefix:'00T',singular:'Task',label:'Tasks',description:'Follow-up activities connected with CRM records',fields:{Subject:{label:'Subject',type:'text',required:true},Status:{label:'Status',type:'select',options:['Not Started','In Progress','Completed']},Priority:{label:'Priority',type:'select',options:['Low','Normal','High']},ActivityDate:{label:'Due date',type:'date'},RelatedToId:{label:'Related record ID',type:'text'},OwnerId:{label:'Owner',type:'user'}}}
};
export const STAGE_PROBABILITIES={'Prospecting':10,'Qualification':25,'Proposal':50,'Negotiation':75,'Closed Won':100,'Closed Lost':0};
export const ROLE_PERMISSIONS={
  Administrator:{leads:'CRUD',accounts:'CRUD',contacts:'CRUD',opportunities:'CRUD',cases:'CRUD',tasks:'CRUD'},
  'Sales Manager':{leads:'CRUD',accounts:'CRUD',contacts:'CRUD',opportunities:'CRUD',cases:'R',tasks:'CRU'},
  'Sales Representative':{leads:'CRU',accounts:'CR',contacts:'CRU',opportunities:'CRU',cases:'R',tasks:'CRU'},
  'Support Agent':{leads:'',accounts:'R',contacts:'R',opportunities:'',cases:'CRUD',tasks:'CRU'}
};
export const WORKFLOWS=[
 {name:'Lead qualification follow-up',trigger:'Lead converted',action:'Create a follow-up task for the sales owner',kind:'lead-converted'},
 {name:'New opportunity follow-up',trigger:'Opportunity created',action:'Create a follow-up task due in three days',kind:'opportunity-created'},
 {name:'High-priority case escalation',trigger:'Case created / updated to High or Critical',action:'Create a priority escalation task',kind:'case-escalation'},
 {name:'Closed Won onboarding',trigger:'Opportunity enters Closed Won',action:'Create a customer onboarding task',kind:'opportunity-won'}
];
