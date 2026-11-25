
import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.API_BASE || 'http://localhost:3000/api';

const managerCredentials = {
  email: 'manager@helpdesk.local',
  password: 'Helpdesk@123'
};

const customerCredentials = {
  email: 'ridha@helpdesk.local',
  password: 'Helpdesk@123'
};

async function login(credentials) {
  return fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
}

async function getToken(credentials) {
  const response = await login(credentials);

  assert.equal(response.status, 201, 'Login should succeed');

  const body = await response.json();

  assert.ok(body.token, 'Login should return a token');

  return body.token;
}

// TEST 1: API HEALTH
test('API health endpoint responds', async () => {
  const response = await fetch(`${base}/health`);

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.status, 'ok');
});

// TEST 2: MANAGER LOGIN
test('Manager can login with valid credentials', async () => {
  const response = await login(managerCredentials);

  assert.equal(response.status, 201);

  const body = await response.json();

  assert.ok(body.token);
  assert.ok(body.user);

  assert.equal(body.user.email, managerCredentials.email);
  assert.equal(body.user.role, 'MANAGER');
});

// TEST 3: INVALID PASSWORD
test('Login rejects an incorrect password', async () => {
  const response = await login({
    email: managerCredentials.email,
    password: 'WrongPassword123'
  });

  assert.equal(response.status, 401);
});

// TEST 4: MISSING CREDENTIALS
test('Login rejects missing credentials', async () => {
  const response = await login({
    email: '',
    password: ''
  });

  assert.equal(response.status, 401);
});

// TEST 5: AUTHENTICATED USER
test('Authenticated manager can access profile', async () => {
  const token = await getToken(managerCredentials);

  const response = await fetch(`${base}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.email, managerCredentials.email);
  assert.equal(body.role, 'MANAGER');
});

// TEST 6: UNAUTHENTICATED USER
test('Profile endpoint rejects requests without a token', async () => {
  const response = await fetch(`${base}/auth/me`);

  assert.equal(response.status, 401);
});

// TEST 7: CUSTOMER REQUEST WORKFLOW
test('Customer can submit a request and manager can approve it', async () => {
  const customerToken = await getToken(customerCredentials);
  const managerToken = await getToken(managerCredentials);

  const uniqueTitle = `API Test Request ${Date.now()}`;

  // STEP 1: CUSTOMER SUBMITS REQUEST
  const createResponse = await fetch(`${base}/ticket-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      title: uniqueTitle,
      description: 'Testing the customer ticket request workflow.'
    })
  });

  assert.equal(createResponse.status, 201);

  const createdRequest = await createResponse.json();

  assert.ok(createdRequest.id);
  assert.equal(createdRequest.title, uniqueTitle);
  assert.equal(createdRequest.status, 'PENDING');

  const requestId = createdRequest.id;

  // STEP 2: MANAGER VIEWS PENDING REQUESTS
  const listResponse = await fetch(
    `${base}/ticket-requests?status=PENDING`,
    {
      headers: {
        Authorization: `Bearer ${managerToken}`
      }
    }
  );

  assert.equal(listResponse.status, 200);

  const requests = await listResponse.json();

  assert.ok(Array.isArray(requests));

  assert.ok(
    requests.some(request => Number(request.id) === Number(requestId)),
    'Manager should see the submitted request'
  );

  // STEP 3: CUSTOMER CANNOT APPROVE THEIR OWN REQUEST
  const forbiddenResponse = await fetch(
    `${base}/ticket-requests/${requestId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        category: 'General',
        priority: 'MEDIUM'
      })
    }
  );

  assert.equal(forbiddenResponse.status, 403);

  // STEP 4: MANAGER APPROVES REQUEST
  const approveResponse = await fetch(
    `${base}/ticket-requests/${requestId}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        category: 'General',
        priority: 'MEDIUM'
      })
    }
  );

  assert.equal(approveResponse.status, 200);

  const approvedRequest = await approveResponse.json();

  assert.equal(approvedRequest.requestId, requestId);
  assert.ok(approvedRequest.ticketId);
  assert.equal(approvedRequest.status, 'OPEN');
  assert.equal(approvedRequest.assignedAgentId, null);

  // STEP 5: CUSTOMER CAN VIEW THE CREATED TICKET
  const ticketResponse = await fetch(
    `${base}/tickets/${approvedRequest.ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    }
  );

  assert.equal(ticketResponse.status, 200);

  const ticketBody = await ticketResponse.json();

  assert.equal(ticketBody.ticket.title, uniqueTitle);
}

);
// TEST 8 : Manager assigns a ticket to an agent and agent cannot claim it again

test('Manager assigns a ticket to an agent and agent cannot claim it again', async () => {
  const managerToken = await getToken(managerCredentials);
  const customerToken = await getToken(customerCredentials);

  const uniqueId = Date.now();

  const agentCredentials = {
    email: `api.agent.${uniqueId}@helpdesk.local`,
    password: 'AgentTest@123'
  };

  // STEP 1: MANAGER CREATES AN AGENT
  const agentCreateResponse = await fetch(`${base}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      name: `API Test Agent ${uniqueId}`,
      ...agentCredentials
    })
  });

  assert.equal(agentCreateResponse.status, 201);

  const createdAgent = await agentCreateResponse.json();

  assert.ok(createdAgent.id);
  assert.equal(createdAgent.role, 'AGENT');

  // STEP 2: CUSTOMER SUBMITS A REQUEST
  const requestResponse = await fetch(`${base}/ticket-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      title: `Assignment Test ${uniqueId}`,
      description: 'Testing manager assignment to an agent.'
    })
  });

  assert.equal(requestResponse.status, 201);

  const request = await requestResponse.json();

  // STEP 3: MANAGER APPROVES AND ASSIGNS THE AGENT
  const approvalResponse = await fetch(
    `${base}/ticket-requests/${request.id}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        category: 'General',
        priority: 'HIGH',
        agentId: createdAgent.id
      })
    }
  );

  assert.equal(approvalResponse.status, 200);

  const approval = await approvalResponse.json();

  assert.ok(approval.ticketId);
  assert.equal(approval.assignedAgentId, createdAgent.id);
  assert.equal(approval.status, 'IN_PROGRESS');

  // STEP 4: AGENT LOGS IN
  const agentToken = await getToken(agentCredentials);

  // STEP 5: AGENT CAN ACCESS THE ASSIGNED TICKET
  const ticketResponse = await fetch(
    `${base}/tickets/${approval.ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${agentToken}`
      }
    }
  );

  assert.equal(ticketResponse.status, 200);

  const ticketBody = await ticketResponse.json();

  assert.equal(
    Number(ticketBody.ticket.assigned_agent_id),
    Number(createdAgent.id)
  );

  assert.equal(ticketBody.ticket.status, 'IN_PROGRESS');

  // STEP 6: AGENT CANNOT CLAIM AN ALREADY ASSIGNED TICKET
  const claimResponse = await fetch(
    `${base}/tickets/${approval.ticketId}/claim`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${agentToken}`
      }
    }
  );

  assert.equal(claimResponse.status, 409);
});

//TEST 9 : Agent completes ticket and manager resolves and closes it

test('Agent completes ticket and manager resolves and closes it', async () => {
  const managerToken = await getToken(managerCredentials);
  const customerToken = await getToken(customerCredentials);

  const uniqueId = Date.now();

  const agentCredentials = {
    email: `lifecycle.agent.${uniqueId}@helpdesk.local`,
    password: 'AgentTest@123'
  };

  // STEP 1: MANAGER CREATES AGENT
  const agentResponse = await fetch(`${base}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      name: `Lifecycle Agent ${uniqueId}`,
      ...agentCredentials
    })
  });

  assert.equal(agentResponse.status, 201);

  const agent = await agentResponse.json();

  // STEP 2: CUSTOMER SUBMITS REQUEST
  const requestResponse = await fetch(`${base}/ticket-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      title: `Lifecycle Test ${uniqueId}`,
      description: 'Testing complete ticket lifecycle.'
    })
  });

  assert.equal(requestResponse.status, 201);

  const request = await requestResponse.json();

  // STEP 3: MANAGER APPROVES AND ASSIGNS
  const approvalResponse = await fetch(
    `${base}/ticket-requests/${request.id}/approve`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        category: 'General',
        priority: 'HIGH',
        agentId: agent.id
      })
    }
  );

  assert.equal(approvalResponse.status, 200);

  const approval = await approvalResponse.json();
  const ticketId = approval.ticketId;

  assert.ok(ticketId);

  // STEP 4: AGENT LOGS IN
  const agentToken = await getToken(agentCredentials);

  // STEP 5: AGENT COMPLETES TICKET
  const completeResponse = await fetch(
    `${base}/tickets/${ticketId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`
      },
      body: JSON.stringify({
        status: 'COMPLETED'
      })
    }
  );

  assert.equal(completeResponse.status, 200);

  // VERIFY COMPLETED STATUS
  const completedTicketResponse = await fetch(
    `${base}/tickets/${ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${managerToken}`
      }
    }
  );

  assert.equal(completedTicketResponse.status, 200);

  const completedTicket = await completedTicketResponse.json();

  assert.equal(completedTicket.ticket.status, 'COMPLETED');

  // STEP 6: MANAGER RESOLVES TICKET
  const resolveResponse = await fetch(
    `${base}/tickets/${ticketId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        status: 'RESOLVED'
      })
    }
  );

  assert.equal(resolveResponse.status, 200);

  // VERIFY RESOLVED STATUS
  const resolvedTicketResponse = await fetch(
    `${base}/tickets/${ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${managerToken}`
      }
    }
  );

  const resolvedTicket = await resolvedTicketResponse.json();

  assert.equal(resolvedTicket.ticket.status, 'RESOLVED');

  // STEP 7: MANAGER CLOSES TICKET
  const closeResponse = await fetch(
    `${base}/tickets/${ticketId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({
        status: 'CLOSED'
      })
    }
  );

  assert.equal(closeResponse.status, 200);

  // VERIFY CLOSED STATUS
  const closedTicketResponse = await fetch(
    `${base}/tickets/${ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${managerToken}`
      }
    }
  );

  const closedTicket = await closedTicketResponse.json();

  assert.equal(closedTicket.ticket.status, 'CLOSED');
});

// ======================================================
// CHAT API TESTS
// ======================================================

async function chatRequest(method, path, token, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {})
  });

  const data = await response.json().catch(() => ({}));

  return { response, data };
}

// Create an agent and return its details and token.
async function createChatTestAgent(managerToken, label) {
  const email = `chat-agent-${label}-${Date.now()}@helpdesk.local`;

  const { response, data } = await chatRequest(
    'POST',
    '/agents',
    managerToken,
    {
      name: `Chat Agent ${label}`,
      email,
      password: 'AgentTest@123'
    }
  );

  assert.equal(response.status, 201);
  assert.ok(data.id, 'Agent should be created');

  const token = await getToken({
    email,
    password: 'AgentTest@123'
  });

  return { ...data, token };
}

// Create a ticket and assign it to the given agent.
async function createChatTestTicket(
  managerToken,
  customerToken,
  agentId
) {
  const title = `Chat API Ticket ${Date.now()}`;

  const requestResult = await chatRequest(
    'POST',
    '/ticket-requests',
    customerToken,
    {
      title,
      description: 'Testing private and internal messaging'
    }
  );

  assert.equal(requestResult.response.status, 201);
  assert.ok(requestResult.data.id);

  const approvalResult = await chatRequest(
    'PATCH',
    `/ticket-requests/${requestResult.data.id}/approve`,
    managerToken,
    {
      category: 'General',
      priority: 'HIGH',
      agentId
    }
  );

  assert.equal(approvalResult.response.status, 200);
  assert.ok(approvalResult.data.ticketId);

  return approvalResult.data.ticketId;
}

// ======================================================
// TEST 1: PRIVATE CHAT + INTERNAL CHAT
// ======================================================

test('Private and internal chat API should enforce access and persist messages', async () => {

  const managerToken = await getToken(managerCredentials);
  const customerToken = await getToken(customerCredentials);

  // Create assigned agent.
  const assignedAgent = await createChatTestAgent(
    managerToken,
    'assigned'
  );

  // Create another agent who is NOT assigned.
  const otherAgent = await createChatTestAgent(
    managerToken,
    'unassigned'
  );

  // Create ticket assigned to first agent.
  const ticketId = await createChatTestTicket(
    managerToken,
    customerToken,
    assignedAgent.id
  );

  // --------------------------------------------------
  // 1. CUSTOMER SENDS PRIVATE MESSAGE
  // --------------------------------------------------

  const customerMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    customerToken,
    {
      message: 'Hello agent, I need help with my issue.'
    }
  );

  assert.equal(customerMessage.response.status, 201);
  assert.equal(
    customerMessage.data.message,
    'Hello agent, I need help with my issue.'
  );

  assert.equal(
    customerMessage.data.sender_role,
    'CUSTOMER'
  );

  // --------------------------------------------------
  // 2. ASSIGNED AGENT CAN READ PRIVATE MESSAGE
  // --------------------------------------------------

  const agentMessages = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    assignedAgent.token
  );

  assert.equal(agentMessages.response.status, 200);
  assert.ok(Array.isArray(agentMessages.data));

  assert.ok(
    agentMessages.data.some(
      message =>
        message.message ===
        'Hello agent, I need help with my issue.'
    )
  );

  // --------------------------------------------------
  // 3. AGENT REPLIES
  // --------------------------------------------------

  const agentReply = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    assignedAgent.token,
    {
      message: 'Hello customer, I am checking your issue.'
    }
  );

  assert.equal(agentReply.response.status, 201);
  assert.equal(
    agentReply.data.message,
    'Hello customer, I am checking your issue.'
  );

  assert.equal(agentReply.data.sender_role, 'AGENT');

  // --------------------------------------------------
  // 4. CUSTOMER CAN READ AGENT REPLY
  // --------------------------------------------------

  const customerHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    customerToken
  );

  assert.equal(customerHistory.response.status, 200);

  assert.ok(
    customerHistory.data.some(
      message =>
        message.message ===
        'Hello customer, I am checking your issue.'
    )
  );

  // --------------------------------------------------
  // 5. PRIVATE CHAT HISTORY PERSISTS
  // --------------------------------------------------

  const persistedHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    customerToken
  );

  assert.equal(persistedHistory.response.status, 200);

  assert.ok(
    persistedHistory.data.length >= 2,
    'Both private messages should be stored'
  );

  // --------------------------------------------------
  // 6. MANAGER CANNOT ACCESS PRIVATE CHAT
  // --------------------------------------------------

  const managerPrivateChat = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    managerToken
  );

  assert.equal(managerPrivateChat.response.status, 403);

  // Manager cannot send private messages either.
  const managerPrivateSend = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    managerToken,
    {
      message: 'This should not be allowed.'
    }
  );

  assert.equal(managerPrivateSend.response.status, 403);

  // --------------------------------------------------
  // 7. UNASSIGNED AGENT CANNOT ACCESS PRIVATE CHAT
  // --------------------------------------------------

  const unassignedPrivateChat = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    otherAgent.token
  );

  assert.equal(unassignedPrivateChat.response.status, 403);

  const unassignedPrivateSend = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    otherAgent.token,
    {
      message: 'Unauthorized private message.'
    }
  );

  assert.equal(unassignedPrivateSend.response.status, 403);

  // --------------------------------------------------
  // 8. MANAGER SENDS INTERNAL MESSAGE
  // --------------------------------------------------

  const internalManagerMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    managerToken,
    {
      message: 'Internal note: Please investigate the issue.'
    }
  );

  assert.equal(internalManagerMessage.response.status, 201);

  assert.equal(
    internalManagerMessage.data.message,
    'Internal note: Please investigate the issue.'
  );

  assert.equal(
    internalManagerMessage.data.sender_role,
    'MANAGER'
  );

  // --------------------------------------------------
  // 9. ASSIGNED AGENT CAN READ INTERNAL MESSAGE
  // --------------------------------------------------

  const internalAgentHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/internal-messages`,
    assignedAgent.token
  );

  assert.equal(internalAgentHistory.response.status, 200);

  assert.ok(
    internalAgentHistory.data.some(
      message =>
        message.message ===
        'Internal note: Please investigate the issue.'
    )
  );

  // --------------------------------------------------
  // 10. AGENT REPLIES INTERNALLY
  // --------------------------------------------------

  const internalAgentReply = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    assignedAgent.token,
    {
      message: 'Internal update: Investigation started.'
    }
  );

  assert.equal(internalAgentReply.response.status, 201);

  assert.equal(
    internalAgentReply.data.message,
    'Internal update: Investigation started.'
  );

  // --------------------------------------------------
  // 11. MANAGER CAN READ AGENT INTERNAL REPLY
  // --------------------------------------------------

  const managerInternalHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/internal-messages`,
    managerToken
  );

  assert.equal(managerInternalHistory.response.status, 200);

  assert.ok(
    managerInternalHistory.data.some(
      message =>
        message.message ===
        'Internal update: Investigation started.'
    )
  );

  // --------------------------------------------------
  // 12. CUSTOMER CANNOT ACCESS INTERNAL CHAT
  // --------------------------------------------------

  const customerInternalHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/internal-messages`,
    customerToken
  );

  assert.equal(customerInternalHistory.response.status, 403);

  const customerInternalSend = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    customerToken,
    {
      message: 'Customer should not see this channel.'
    }
  );

  assert.equal(customerInternalSend.response.status, 403);

  // --------------------------------------------------
  // 13. UNASSIGNED AGENT CANNOT ACCESS INTERNAL CHAT
  // --------------------------------------------------

  const unassignedInternalHistory = await chatRequest(
    'GET',
    `/tickets/${ticketId}/internal-messages`,
    otherAgent.token
  );

  assert.equal(unassignedInternalHistory.response.status, 403);

  const unassignedInternalSend = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    otherAgent.token,
    {
      message: 'Unauthorized internal message.'
    }
  );

  assert.equal(unassignedInternalSend.response.status, 403);

  // --------------------------------------------------
  // 14. PRIVATE AND INTERNAL MESSAGES MUST BE SEPARATE
  // --------------------------------------------------

  const privateFinal = await chatRequest(
    'GET',
    `/tickets/${ticketId}/messages`,
    customerToken
  );

  const internalFinal = await chatRequest(
    'GET',
    `/tickets/${ticketId}/internal-messages`,
    managerToken
  );

  assert.ok(
    !privateFinal.data.some(
      message =>
        message.message ===
        'Internal note: Please investigate the issue.'
    ),
    'Internal messages must not appear in private chat'
  );

  assert.ok(
    !internalFinal.data.some(
      message =>
        message.message ===
        'Hello agent, I need help with my issue.'
    ),
    'Private messages must not appear in internal chat'
  );

  // --------------------------------------------------
  // 15. EMPTY PRIVATE MESSAGE REJECTED
  // --------------------------------------------------

  const emptyPrivateMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    customerToken,
    {
      message: '   '
    }
  );

  assert.equal(emptyPrivateMessage.response.status, 400);

  // --------------------------------------------------
  // 16. PRIVATE MESSAGE OVER 2000 CHARACTERS REJECTED
  // --------------------------------------------------

  const longPrivateMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/messages`,
    customerToken,
    {
      message: 'A'.repeat(2001)
    }
  );

  assert.equal(longPrivateMessage.response.status, 400);

  // --------------------------------------------------
  // 17. EMPTY INTERNAL MESSAGE REJECTED
  // --------------------------------------------------

  const emptyInternalMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    managerToken,
    {
      message: '   '
    }
  );

  assert.equal(emptyInternalMessage.response.status, 400);

  // --------------------------------------------------
  // 18. INTERNAL MESSAGE OVER 2000 CHARACTERS REJECTED
  // --------------------------------------------------

  const longInternalMessage = await chatRequest(
    'POST',
    `/tickets/${ticketId}/internal-messages`,
    managerToken,
    {
      message: 'A'.repeat(2001)
    }
  );

  assert.equal(longInternalMessage.response.status, 400);

  console.log('Private and internal chat tests completed.');
});



