
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3454);

const FILE_PATH = path.resolve(
    process.cwd(),
    process.env.USERS_FILE ?? "users.json"
);

const MAX_BODY_SIZE = 1024 * 1024;
const MAX_NAME_LENGTH = 100;

// CUSTOM ERROR

class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

// RESPONSE

function sendJson(res, statusCode, data) {
    if (res.headersSent || res.destroyed || res.writableEnded) {
        return;
    }

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
    });

    res.end(JSON.stringify(data));
}

// VALIDATION

function validateId(id) {
    return (
        typeof id === "number" &&
        Number.isSafeInteger(id) &&
        id > 0
    );
}

function normalizeName(name) {
    return name
        .normalize("NFKC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function validateName(name) {
    if (typeof name !== "string") {
        throw new AppError(400, "Name must be a string");
    }

    const trimmedName = name
        .normalize("NFKC")
        .trim()
        .replace(/\s+/g, " ");

    if (!trimmedName) {
        throw new AppError(400, "Name cannot be empty");
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
        throw new AppError(
            400,
            `Name cannot exceed ${MAX_NAME_LENGTH} characters`
        );
    }

    if (/[\u0000-\u001F\u007F]/u.test(trimmedName)) {
        throw new AppError(
            400,
            "Name cannot contain control characters"
        );
    }

    return trimmedName;
}

function checkDuplicateId(users, id) {
    return users.some(user => user.id === id);
}

function checkDuplicateName(users, name) {
    const normalizedName = normalizeName(name);

    return users.some(
        user => normalizeName(user.name) === normalizedName
    );
}

function validateFields(data, allowedFields) {
    const invalidFields = Object.keys(data).filter(
        field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new AppError(
            400,
            `Invalid fields: ${invalidFields.join(", ")}`
        );
    }
}

// VALIDATE EXISTING JSON DATA

function validateUsers(users) {
    if (!Array.isArray(users)) {
        throw new AppError(500, "Invalid users data file");
    }

    const ids = new Set();
    const names = new Set();

    for (const user of users) {
        if (
            !user ||
            typeof user !== "object" ||
            Array.isArray(user)
        ) {
            throw new AppError(500, "Invalid user record in data file");
        }

        if (!validateId(user.id)) {
            throw new AppError(500, "Invalid User ID in data file");
        }

        if (
            typeof user.name !== "string" ||
            !user.name.trim()
        ) {
            throw new AppError(500, "Invalid User Name in data file");
        }

        const normalizedName = normalizeName(user.name);

        if (normalizedName.length > MAX_NAME_LENGTH) {
            throw new AppError(500, "User Name too long in data file");
        }

        if (/[\u0000-\u001F\u007F]/u.test(user.name)) {
            throw new AppError(500, "Invalid User Name in data file");
        }

        if (ids.has(user.id)) {
            throw new AppError(
                500,
                `Duplicate User ID Found: ${user.id}`
            );
        }

        if (names.has(normalizedName)) {
            throw new AppError(
                500,
                `Duplicate User Name Found: ${user.name}`
            );
        }

        ids.add(user.id);
        names.add(normalizedName);
    }

    return users;
}

// FILE OPERATIONS

async function writeUsers(users) {
    const directory = path.dirname(FILE_PATH);
    const tempPath = `${FILE_PATH}.${randomUUID()}.tmp`;

    try {
        await fs.mkdir(directory, { recursive: true });

        await fs.writeFile(
            tempPath,
            JSON.stringify(users, null, 2),
            {
                encoding: "utf8",
                flag: "wx"
            }
        );

        await fs.rename(tempPath, FILE_PATH);
    } catch (error) {
        await fs.unlink(tempPath).catch(() => {});
        throw error;
    }
}

async function readUsers() {
    try {
        const data = await fs.readFile(FILE_PATH, "utf8");

        let users;

        try {
            users = JSON.parse(data);
        } catch {
            throw new AppError(
                500,
                "Users data file contains invalid JSON"
            );
        }

        return validateUsers(users);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeUsers([]);
            return [];
        }

        throw error;
    }
}

// FILE OPERATION QUEUE
// Prevents simultaneous modifications in this server process.

let fileQueue = Promise.resolve();

function withFileLock(task) {
    const operation = fileQueue.then(task, task);

    fileQueue = operation.catch(() => {});

    return operation;
}

// REQUEST BODY

async function readRequestBody(req) {
    const contentType = req.headers["content-type"] || "";

    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
        throw new AppError(
            415,
            "Content-Type must be application/json"
        );
    }

    const contentEncoding = req.headers["content-encoding"];

    if (
        contentEncoding &&
        contentEncoding.toLowerCase() !== "identity"
    ) {
        throw new AppError(
            415,
            "Compressed request bodies are not supported"
        );
    }

    const contentLength = req.headers["content-length"];

    if (
        contentLength !== undefined &&
        Number(contentLength) > MAX_BODY_SIZE
    ) {
        req.resume();
        throw new AppError(413, "Request body is too large");
    }

    const chunks = [];
    let totalSize = 0;

    for await (const chunk of req) {
        totalSize += chunk.length;

        if (totalSize > MAX_BODY_SIZE) {
            req.resume();
            throw new AppError(413, "Request body is too large");
        }

        chunks.push(chunk);
    }

    if (totalSize === 0) {
        throw new AppError(400, "Request body cannot be empty");
    }

    let body;

    try {
        const decoder = new TextDecoder("utf-8", { fatal: true });

        const json = decoder.decode(Buffer.concat(chunks));

        body = JSON.parse(json);
    } catch {
        throw new AppError(
            400,
            "Invalid JSON or UTF-8 request body"
        );
    }

    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        throw new AppError(
            400,
            "Request body must be a JSON object"
        );
    }

    return body;
}

// PARSE URL ID

function parseId(idParam) {
    if (!/^[1-9]\d*$/.test(idParam || "")) {
        throw new AppError(400, "Valid User ID is Required");
    }

    const id = Number(idParam);

    if (!validateId(id)) {
        throw new AppError(400, "Invalid User ID");
    }

    return id;
}

// GET ALL USERS

async function handleGetUsers(res) {
    const users = await withFileLock(readUsers);

    sendJson(res, 200, {
        message: "Users Retrieved Successfully",
        count: users.length,
        data: users
    });
}

// GET USER BY ID

async function handleGetUserById(idParam, res) {
    const id = parseId(idParam);

    const user = await withFileLock(async () => {
        const users = await readUsers();

        return users.find(user => user.id === id);
    });

    if (!user) {
        throw new AppError(404, "User Not Found");
    }

    sendJson(res, 200, {
        message: "User Retrieved Successfully",
        data: user
    });
}

// CREATE USER - POST

async function handleCreateUser(req, res) {
    const userData = await readRequestBody(req);

    // POST does not allow manually supplied IDs.

    if (Object.hasOwn(userData, "id")) {
        throw new AppError(
            400,
            "User ID must not be provided. ID is generated automatically"
        );
    }

    validateFields(userData, ["name"]);

    if (!Object.hasOwn(userData, "name")) {
        throw new AppError(400, "Name is Required");
    }

    const name = validateName(userData.name);

    const newUser = await withFileLock(async () => {
        const users = await readUsers();

        // Check duplicate name.

        if (checkDuplicateName(users, name)) {
            throw new AppError(
                409,
                "Duplicate User Name. User Already Exists"
            );
        }

        // Generate ID automatically.

        const maxId = users.reduce(
            (max, user) => Math.max(max, user.id),
            0
        );

        if (maxId >= Number.MAX_SAFE_INTEGER) {
            throw new AppError(
                500,
                "Unable to generate a new User ID"
            );
        }

        const id = maxId + 1;

        if (checkDuplicateId(users, id)) {
            throw new AppError(
                409,
                `Duplicate User ID: ${id}`
            );
        }

        const user = { id, name };

        users.push(user);

        await writeUsers(users);

        return user;
    });

    sendJson(res, 201, {
        message: "User Created Successfully",
        data: newUser
    });
}

// UPDATE USER - PUT

async function handleUpdateUser(idParam, req, res) {
    const id = parseId(idParam);

    const userData = await readRequestBody(req);

    // PUT also does not allow an ID in the body.

    if (Object.hasOwn(userData, "id")) {
        throw new AppError(
            400,
            "User ID must not be provided in request body. Use URL ID"
        );
    }

    validateFields(userData, ["name"]);

    if (!Object.hasOwn(userData, "name")) {
        throw new AppError(400, "Name is Required");
    }

    const name = validateName(userData.name);

    const updatedUser = await withFileLock(async () => {
        const users = await readUsers();

        const index = users.findIndex(
            user => user.id === id
        );

        if (index === -1) {
            throw new AppError(404, "User Not Found");
        }

        // STRICT DUPLICATE CHECK:
        // Checks ALL existing users, including the current user.
        // Therefore, sending the same existing name also returns 409.

        if (checkDuplicateName(users, name)) {
            throw new AppError(
                409,
                "Duplicate User Name. This name already exists"
            );
        }

        const updated = {
            id,
            name
        };

        users[index] = updated;

        await writeUsers(users);

        return updated;
    });

    sendJson(res, 200, {
        message: "User Updated Successfully",
        data: updatedUser
    });
}

// DELETE USER

async function handleDeleteUser(url, res) {
    const idParams = url.searchParams.getAll("id");

    if (idParams.length === 0) {
        throw new AppError(
            400,
            "User ID is Required. Use DELETE /users?id=1"
        );
    }

    if (idParams.length !== 1) {
        throw new AppError(
            400,
            "Only one User ID can be provided"
        );
    }

    const id = parseId(idParams[0]);

    const deletedUser = await withFileLock(async () => {
        const users = await readUsers();

        const index = users.findIndex(
            user => user.id === id
        );

        if (index === -1) {
            throw new AppError(404, "User Not Found");
        }

        const [deleted] = users.splice(index, 1);

        await writeUsers(users);

        return deleted;
    });

    sendJson(res, 200, {
        message: "User Deleted Successfully",
        data: deletedUser
    });
}

// MAIN REQUEST HANDLER

async function handleRequest(req, res) {
    let url;

    try {
        url = new URL(
            req.url,
            `http://${req.headers.host || "localhost"}`
        );
    } catch {
        throw new AppError(400, "Invalid Request URL");
    }

    const method = req.method;

    const route = url.pathname.replace(/\/+$/, "") || "/";

    console.log(`${method} ${route}`);

    const userByIdMatch = route.match(/^\/users\/([^/]+)$/);

    if (method === "GET" && route === "/users") {
        await handleGetUsers(res);
        return;
    }

    if (method === "GET" && userByIdMatch) {
        await handleGetUserById(userByIdMatch[1], res);
        return;
    }

    if (method === "POST" && route === "/users") {
        await handleCreateUser(req, res);
        return;
    }

    if (method === "PUT" && userByIdMatch) {
        await handleUpdateUser(
            userByIdMatch[1],
            req,
            res
        );
        return;
    }

    if (method === "DELETE" && route === "/users") {
        await handleDeleteUser(url, res);
        return;
    }

    // Method not allowed.

    if (route === "/users" || userByIdMatch) {
        res.setHeader(
            "Allow",
            userByIdMatch
                ? "GET, PUT"
                : "GET, POST, DELETE"
        );

        throw new AppError(405, "Method Not Allowed");
    }

    throw new AppError(404, "Route Not Found");
}

// HTTP SERVER

const server = http.createServer(async (req, res) => {
    try {
        await handleRequest(req, res);
    } catch (error) {
        if (
            res.destroyed ||
            res.writableEnded ||
            req.aborted
        ) {
            return;
        }

        const statusCode = error instanceof AppError
            ? error.statusCode
            : 500;

        if (statusCode >= 500) {
            console.error(error);
        }

        sendJson(res, statusCode, {
            message: statusCode === 500
                ? "Internal Server Error"
                : error.message
        });
    }
});

// CONNECTION ERROR

server.on("clientError", (error, socket) => {
    console.error("Client Error:", error.message);

    if (socket.writable) {
        socket.end(
            "HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n"
        );
    }
});

// SERVER TIMEOUT SETTINGS

server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.keepAliveTimeout = 5000;

// PORT VALIDATION

if (
    !Number.isInteger(PORT) ||
    PORT < 1 ||
    PORT > 65535
) {
    throw new Error("Invalid PORT configuration");
}

// START SERVER

server.listen(PORT, () => {
    console.log(
        `REST API Running at http://localhost:${PORT}`
    );

    console.log(`Users File: ${FILE_PATH}`);
});

server.on("error", error => {
    console.error("Server Error:", error);
});
