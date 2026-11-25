
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import formidable from 'formidable';

// PATHS

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_DIR = path.join(__dirname, 'public');
const PUBLIC_FILE = path.join(PUBLIC_DIR, 'index.html');

const uploadFolder = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const JSON_FILE = path.join(DATA_DIR, 'uploads.json');

const PORT = 3343;

const MAX_SIZE = 10 * 1024 * 1024;

// ALLOWED FILE TYPES

const ALLOWED_TYPES = new Map([
    ['.pdf', 'application/pdf'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.txt', 'text/plain']
]);

// STATIC FILES

const STATIC_FILES = {
    '/styles.css': {
        file: 'styles.css',
        type: 'text/css'
    },
    '/script.js': {
        file: 'script.js',
        type: 'application/javascript'
    }
};

// INITIALIZE FOLDERS

async function initialize() {

    await fs.mkdir(uploadFolder, { recursive: true });

    await fs.mkdir(DATA_DIR, { recursive: true });

    try {

        await fs.access(JSON_FILE);

    } catch (error) {

        if (error.code !== 'ENOENT') {
            throw error;
        }

        await fs.writeFile(JSON_FILE, '[]\n');

    }

}

// SEND JSON RESPONSE

function sendJSON(res, status, data) {

    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
    });

    res.end(JSON.stringify(data));

}

// READ UPLOAD RECORDS

async function getUploads() {

    const data = await fs.readFile(JSON_FILE, 'utf8');

    return JSON.parse(data);

}

// SAVE UPLOAD RECORDS SAFELY

let saveQueue = Promise.resolve();

function saveUpload(record) {

    const operation = saveQueue.catch(() => { }).then(async () => {

        const records = await getUploads();

        records.push(record);

        await fs.writeFile(
            JSON_FILE,
            JSON.stringify(records, null, 2) + '\n'
        );

    });

    saveQueue = operation;

    return operation;

}

// DELETE TEMPORARY UPLOADED FILE

async function deleteUploadedFile(file) {

    if (file?.filepath) {

        await fs.unlink(file.filepath).catch(() => { });

    }

}

// HANDLE FILE UPLOAD

async function handleUpload(req, res) {

    const contentType = req.headers['content-type'] || '';

    if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {

        sendJSON(res, 415, {
            message: 'Please use multipart/form-data.'
        });

        return;

    }

    let rejectionReason = '';

    const form = formidable({

        uploadDir: uploadFolder,

        keepExtensions: true,

        maxFiles: 1,

        maxFileSize: MAX_SIZE,

        allowEmptyFiles: false,

        minFileSize: 1,

        filename: (_name, _extension, part) => {

            const ext = path.extname(
                part.originalFilename || ''
            ).toLowerCase();

            return randomUUID() + ext;

        },

        filter: ({ originalFilename, mimetype }) => {

            const ext = path.extname(
                originalFilename || ''
            ).toLowerCase();

            const expectedMime = ALLOWED_TYPES.get(ext);

            // Check supported extension

            if (!expectedMime) {

                rejectionReason =
                    'Unsupported file format. Only PDF, PNG, JPG, JPEG and TXT files are allowed.';

                return false;

            }

            // Check MIME type

            if (expectedMime !== mimetype) {

                rejectionReason =
                    'File extension and MIME type do not match.';

                return false;

            }

            return true;

        }

    });

    let uploadedFile;

    try {

        // PARSE FORM DATA

        const [fields, files] = await form.parse(req);

        uploadedFile = files.document?.[0];

        // CHECK FILE EXISTENCE

        if (!uploadedFile) {

            sendJSON(res, 400, {
                message: rejectionReason ||
                    'Please select a valid file.'
            });

            return;

        }

        // CHECK FILE SIZE

        if (uploadedFile.size > MAX_SIZE) {

            await deleteUploadedFile(uploadedFile);

            sendJSON(res, 413, {
                message: 'File size must not exceed 10 MB.'
            });

            return;

        }

        // CHECK EMPTY FILE

        if (uploadedFile.size === 0) {

            await deleteUploadedFile(uploadedFile);

            sendJSON(res, 400, {
                message: 'Empty files are not allowed.'
            });

            return;

        }

        // CHECK UPLOADER NAME

        const uploadedBy = String(
            fields.uploadedBy?.[0] || ''
        ).trim();

        if (!uploadedBy) {

            await deleteUploadedFile(uploadedFile);

            sendJSON(res, 400, {
                message: 'Uploaded by name is required.'
            });

            return;

        }

        // PREPARE METADATA

        const record = {

            id: randomUUID(),

            uploadedBy,

            originalName: path.basename(
                uploadedFile.originalFilename || 'unknown'
            ),

            savedName: uploadedFile.newFilename,

            filePath: `uploads/${uploadedFile.newFilename}`,

            fileType: uploadedFile.mimetype,

            fileSize: uploadedFile.size,

            uploadedAT: new Date().toISOString()

        };

        // SAVE METADATA

        await saveUpload(record);

        // SUCCESS RESPONSE

        sendJSON(res, 201, {

            message: 'File Uploaded Successfully',

            file: record

        });

    } catch (error) {

        await deleteUploadedFile(uploadedFile);

        console.error('Upload Error:', error.message);

        let status = 500;

        let errorMessage = 'Upload Failed. Please try again.';

        if (error.httpCode === 413) {

            status = 413;

            errorMessage = 'File size must not exceed 10 MB.';

        } else if (error.code === 'ENOENT') {

            status = 500;

            errorMessage = 'Upload storage is unavailable.';

        }

        if (!res.headersSent) {

            sendJSON(res, status, {
                message: errorMessage
            });

        }

    }

}

// SERVE STATIC FILES

async function serveStaticFile(res, pathname) {

    const staticFile = STATIC_FILES[pathname];

    if (!staticFile) {
        return false;
    }

    const filePath = path.join(
        PUBLIC_DIR,
        staticFile.file
    );

    try {

        const content = await fs.readFile(filePath);

        res.writeHead(200, {
            'Content-Type': staticFile.type,
            'X-Content-Type-Options': 'nosniff'
        });

        res.end(content);

    } catch (error) {

        if (error.code === 'ENOENT') {

            sendJSON(res, 404, {
                message: 'Static file not found.'
            });

        } else {

            throw error;

        }

    }

    return true;

}

// HANDLE DOWNLOAD

async function handleDownload(res, pathname) {

    const filename = pathname.slice('/uploads/'.length);

    // VALIDATE GENERATED FILENAME

    if (!/^[0-9a-f-]{36}\.(pdf|png|jpe?g|txt)$/i.test(filename)) {

        sendJSON(res, 400, {
            message: 'Invalid file path.'
        });

        return;

    }

    try {

        const filePath = path.join(uploadFolder, filename);

        const contents = await fs.readFile(filePath);

        res.writeHead(200, {

            'Content-Type': 'application/octet-stream',

            'Content-Disposition':
                `attachment; filename="${filename}"`,

            'X-Content-Type-Options': 'nosniff'

        });

        res.end(contents);

    } catch (error) {

        if (error.code === 'ENOENT') {

            sendJSON(res, 404, {
                message: 'File not found.'
            });

        } else {

            throw error;

        }

    }

}

// HANDLE HTTP REQUESTS

async function handleRequest(req, res) {

    const pathname = new URL(
        req.url,
        'http://localhost'
    ).pathname;

    try {

        // HOME PAGE

        if (req.method === 'GET' && pathname === '/') {

            const html = await fs.readFile(PUBLIC_FILE);

            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Content-Type-Options': 'nosniff'
            });

            res.end(html);

        }

        // CSS AND JAVASCRIPT

        else if (req.method === 'GET' && STATIC_FILES[pathname]) {

            await serveStaticFile(res, pathname);

        }

        // UPLOAD API

        else if (req.method === 'POST' && pathname === '/upload') {

            await handleUpload(req, res);

        }

        // GET UPLOADS API

        else if (req.method === 'GET' && pathname === '/api/uploads') {

            sendJSON(res, 200, await getUploads());

        }

        // DOWNLOAD API

        else if (
            req.method === 'GET' &&
            pathname.startsWith('/uploads/')
        ) {

            await handleDownload(res, pathname);

        }

        // INVALID ROUTE

        else {

            sendJSON(res, 404, {
                message: 'Route not found.'
            });

        }

    } catch (error) {

        console.error('Server Error:', error.message);

        if (!res.headersSent) {

            sendJSON(res, 500, {
                message: 'Internal server error.'
            });

        } else {

            res.destroy();

        }

    }

}

// INITIALIZE AND START SERVER

await initialize();

http.createServer(handleRequest).listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});
