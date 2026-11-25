
import http from "node:http";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 3400);

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Employee details
const employee = {
  id: 101,
  name: "Krishna",
  email: process.env.EMPLOYEE_EMAIL || "krishna@company.com",
  password: process.env.EMPLOYEE_PASSWORD || "Demo@123"
};

// Server-side session storage
const sessions = new Map();

const SESSION_DURATION = 30 * 60 * 1000;
const MAX_BODY_SIZE = 10 * 1024;

const COOKIE_NAME = "sessionId";

// Cookie configuration
const cookieOptions = [
  "HttpOnly",
  "Path=/",
  "SameSite=Lax",
  `Max-Age=${SESSION_DURATION / 1000}`,
  ...(isProduction ? ["Secure"] : [])
].join("; ");

// Send JSON response
function sendJSON(res, status, data, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });

  res.end(JSON.stringify(data));
}

// Read request body
async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > MAX_BODY_SIZE) {
      throw new Error("Request body is too large");
    }

    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString();

  return body ? JSON.parse(body) : {};
}

// Read cookie
function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const cookie = cookies
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`));

  return cookie
    ? cookie.substring(name.length + 1)
    : null;
}

// Create session cookie
function createSessionCookie(sessionId) {
  return `${COOKIE_NAME}=${sessionId}; ${cookieOptions}`;
}

// Clear session cookie
function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${
    isProduction ? "; Secure" : ""
  }`;
}

// Remove expired sessions
function cleanExpiredSessions() {
  const currentTime = Date.now();

  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt <= currentTime) {
      sessions.delete(sessionId);
    }
  }
}

// Validate session
function validateSession(req) {
  const sessionId = getCookie(req, COOKIE_NAME);

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return {
    sessionId,
    session
  };
}

// HTTP server
const server = http.createServer(async (req, res) => {

  try {

    cleanExpiredSessions();

    const method = req.method;

    const pathname = new URL(
      req.url,
      "http://localhost"
    ).pathname;


    // HOME
    if (method === "GET" && pathname === "/") {

      const html = await readFile(
        new URL("./index.html", import.meta.url)
      );

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      return res.end(html);
    }


    // LOGIN
    if (method === "POST" && pathname === "/login") {

      let credentials;

      try {

        credentials = await readBody(req);

      } catch (error) {

        return sendJSON(res, 400, {
          message: "Invalid JSON or request body"
        });

      }

      const { email, password } = credentials;

      // Validate empty fields
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {

        return sendJSON(res, 400, {
          message: "Email and password are required"
        });

      }

      // Validate credentials
      if (
        email.trim().toLowerCase() !== employee.email.toLowerCase() ||
        password !== employee.password
      ) {

        return sendJSON(res, 401, {
          message: "Invalid email or password"
        });

      }

      // Generate random session ID
      const sessionId = randomBytes(32).toString("hex");

      // Store session on server
      const sessionData = {

        employeeId: employee.id,
        name: employee.name,
        email: employee.email,

        createdAt: Date.now(),

        expiresAt: Date.now() + SESSION_DURATION

      };

      sessions.set(sessionId, sessionData);

      return sendJSON(
        res,
        200,
        {
          message: "Login successful",

          employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email
          },

          session: {
            expiresAt: sessionData.expiresAt,
            duration: SESSION_DURATION
          }
        },
        {
          "Set-Cookie": createSessionCookie(sessionId)
        }
      );

    }


    // SESSION
    if (method === "GET" && pathname === "/session") {

      const result = validateSession(req);

      if (!result) {

        return sendJSON(res, 401, {
          message: "No active session. Please login."
        });

      }

      // IMPORTANT: Return sessionId to frontend
      return sendJSON(res, 200, {

        message: "Active session found",

        session: {

          sessionId: result.sessionId,

          employeeId: result.session.employeeId,

          name: result.session.name,

          email: result.session.email,

          createdAt: result.session.createdAt,

          expiresAt: result.session.expiresAt

        }

      });

    }


    // PROFILE
    if (method === "GET" && pathname === "/profile") {

      const result = validateSession(req);

      if (!result) {

        return sendJSON(res, 401, {
          message: "Please login first"
        });

      }

      return sendJSON(res, 200, {

        message: "Profile accessed successfully",

        employee: {
          id: result.session.employeeId,
          name: result.session.name,
          email: result.session.email
        }

      });

    }


    // LOGOUT
    if (method === "POST" && pathname === "/logout") {

      const sessionId = getCookie(req, COOKIE_NAME);

      if (sessionId) {
        sessions.delete(sessionId);
      }

      return sendJSON(
        res,
        200,
        {
          message: "Logged out successfully"
        },
        {
          "Set-Cookie": clearSessionCookie()
        }
      );

    }


    // VIEW SERVER-SIDE SESSIONS
    if (method === "GET" && pathname === "/sessions") {

      if (NODE_ENV === "production") {

        return sendJSON(res, 404, {
          message: "Route not found"
        });

      }

      return sendJSON(res, 200, {

        message: "Server-side sessions",

        totalSessions: sessions.size,

        sessions: Array.from(sessions.entries()).map(
          ([sessionId, session]) => ({

            sessionId,

            employeeId: session.employeeId,

            email: session.email,

            createdAt: session.createdAt,

            expiresAt: session.expiresAt

          })
        )

      });

    }


    // INVALID ROUTE
    return sendJSON(res, 404, {
      message: "Route not found"
    });


  } catch (error) {

    console.error("Server error:", error);

    if (!res.headersSent) {

      sendJSON(res, 500, {
        message: "Internal Server Error"
      });

    } else {

      res.end();

    }

  }

});


server.listen(PORT, () => {

  console.log(`Server running at http://localhost:${PORT}`);

});
