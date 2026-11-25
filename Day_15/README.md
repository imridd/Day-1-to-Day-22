# Orbit CMS — Dynamic Composable Website

## Requirements
- Node.js 18+
- npm

## Run
Open two terminals in this folder.

Terminal 1:
```bash
npm install
npm run server
```

Terminal 2:
```bash
npm run dev
```
Open http://localhost:5173

## Demo admin credentials
- Email: admin@example.com
- Password: admin123

The login form starts blank. Enter the credentials manually.

## Page storage
All page configurations (page details, status, and component props/data) are saved as records in the `pages` collection in the project's root `db.json` through JSON Server. There are no automatic JSON downloads.

A browser-based React application cannot directly create or modify source files inside `src/config/pages/`. Keeping page records in `db.json` is the supported JSON Server-only approach without adding a custom backend.

## Included
- React + Vite, React Bootstrap, React Router
- JSON Server mock API using `db.json`
- Axios service layer
- Redux Toolkit slices for auth, pages, and navigation
- Formik + Yup login validation
- Registry-driven component rendering
- Page builder: Hero, Cards, Table, Text, Image, Footer
- JSON-driven Cards and Tables
- Component editing, deletion, reordering, and live preview
- Draft/publish workflow, dynamic public routes, navigation layout
- Multiple pages can be created from the dashboard

## Security note
This is a local demo CMS. Mock credentials are intentionally stored in `db.json`; this is not production authentication.
