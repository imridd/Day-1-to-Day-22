
let activeUser = 'u1';

// --------------------------------------------------
// DEMO USER MANAGEMENT
// --------------------------------------------------

export function setDemoUser(userId) {
  if (!userId) {
    throw new Error('A valid demo user ID is required.');
  }

  activeUser = userId;
}

export function getDemoUser() {
  return activeUser;
}

// --------------------------------------------------
// COMMON API REQUEST
// --------------------------------------------------

export async function request(path, options = {}) {
  try {
    const response = await fetch(`/api${path}`, {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        'x-demo-user': activeUser,
        ...options.headers
      },

      body:
        options.body === undefined
          ? undefined
          : typeof options.body === 'string'
            ? options.body
            : JSON.stringify(options.body)
    });

    // Handle JSON and non-JSON responses safely
    const contentType = response.headers.get('content-type') || '';

    const result = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof result === 'string'
          ? result
          : result.message ||
            result.error ||
            `HTTP ${response.status}`;

      throw new Error(message);
    }

    return result;

  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to connect to CRM backend. Check whether the server is running on port 4100.'
      );
    }

    throw error;
  }
}

// --------------------------------------------------
// HTTP METHODS
// --------------------------------------------------

export const get = (path) =>
  request(path);

export const post = (path, payload) =>
  request(path, {
    method: 'POST',
    body: payload
  });

export const patch = (path, payload) =>
  request(path, {
    method: 'PATCH',
    body: payload
  });

export const del = (path) =>
  request(path, {
    method: 'DELETE'
  });
