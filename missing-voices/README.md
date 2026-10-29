# Missing Voices

Missing Voices is a React single-page **demonstration prototype** for organizing fictional missing-person case records. The project currently contains a browser-only frontend; it is not an official reporting channel or a production registry.

## Important privacy and safety limits

- Use fictional data only. Do not enter real names, contact details, health information, or other sensitive personal information.
- Records are stored in the browser's `localStorage` for this site. They are not encrypted by this app, authenticated, backed up, synchronized to another device, or sent to an agency.
- Anyone with access to the same browser profile and site origin may be able to access the saved records. Clearing browser site data removes them.
- This prototype does not verify reports, contact a reporter, notify police, search hospital or mortuary records, send alerts, or connect to government or international systems.
- Do not deploy or use this application for real cases without an authorized backend, security and privacy review, access controls, operational procedures, and approved data-sharing agreements.

## Current features

- Dashboard with case and status counts, recent records, and navigation to filtered cases.
- Create, view, edit, update status, and delete browser-stored demo cases.
- Search by name, case ID, county, category, or description; filter by status and any of Kenya's 47 counties.
- County-level record counts (not a geographic map).
- Fictional seed records on first use and an explicit privacy/prototype notice.
- Responsive layout, keyboard dismissal for dialogs, accessible form labels, browser-side validation, and visible storage errors.
- Unit tests for local record loading, validation, saving, county coverage, and case ID generation.

## Technology

- React 19
- Vite 8
- Plain JavaScript and CSS
- Browser `localStorage`; no server, database, authentication, or external API

The workspace also contains an empty `Backend/` directory. No backend entry point, API routes, database schema, migrations, or environment configuration are implemented.

## Requirements and setup

Use Node.js 20.19+ or 22.12+ and npm.

From this directory:

```sh
npm install
npm run dev
```

Vite prints a local URL (normally `http://localhost:5173`). To create and preview a production build:

```sh
npm run build
npm run preview
```

## Validation

```sh
npm run lint
npm test
npm run build
```

The tests use Node's built-in test runner and need no additional test dependencies.

## Data behavior

On first load, the app presents three fictional sample records. Changes are written synchronously to local storage before the UI reports success. If saved data cannot be read or a write fails, the app displays an error and disables record changes rather than claiming they were saved. The **Start fresh with demo data** action requires confirmation and replaces local records with the fictional sample set.

## Audit and prioritized next steps

### Completed in this prototype

1. Replaced template-only documentation and misleading live/integration claims with an accurate description of the current application.
2. Added durable browser persistence, record schema checks, unique case IDs, explicit storage failures, and tests.
3. Completed local create/read/update/delete workflows and search/filter behavior.
4. Added field constraints, accessible dialog controls, empty/error states, responsive styles, and privacy warnings.
5. Replaced identifying-looking sample cases and contact numbers with clearly fictional records.

### Required before any real-world use

1. **Critical:** Define a governed backend and threat model for sensitive data, including authentication, role-based authorization, audit logging, encryption, retention, recovery, and incident response.
2. **Critical:** Obtain legal, privacy, and operational approval for the data collected and every intended agency integration; define consent, verification, correction, and deletion procedures.
3. **High:** Build and test a server API with server-side validation, database constraints, access controls, and safe deployment configuration. The current browser-only store cannot provide shared or authoritative records.
4. **High:** Add end-to-end testing and independent accessibility, privacy, and security reviews before deployment.
5. **Medium:** Implement approved integrations only after credentials, contracts, rate limits, monitoring, and failure handling are defined.

These are production requirements, not features implemented by this demonstration.
