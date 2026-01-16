# DBS Frontend (Angular) — Minimal Scaffold (No TypeScript Models)

This is a minimal **src/** folder scaffold for an Angular 20 frontend that uses **Bootstrap** and **JWT** authentication.
It **intentionally does not use TypeScript models/interfaces** — all API data is handled as plain objects (`any`).

## Quick setup (recommended)

1. Install Angular CLI if you don't have it:
```bash
npm install -g @angular/cli
```

2. Create a fresh Angular app (Angular CLI will scaffold full project):
```bash
ng new dbs-frontend --routing --style=css
cd dbs-frontend
```

3. Stop the dev server if running, then **replace** the generated `src/` folder with the `src/` folder from this archive (or copy files manually).

4. Install Bootstrap:
```bash
npm install bootstrap
```

5. Add Bootstrap to `angular.json` -> `projects.dbs-frontend.architect.build.options.styles`:
```json
"node_modules/bootstrap/dist/css/bootstrap.min.css",
"src/styles.css"
```

6. Start the dev server:
```bash
ng serve --open
```

## Backend assumptions
- Backend base URL: `http://localhost:8080` (edit `src/environments/environment.ts` if different)
- Login endpoint: `POST /auth/login` with `{ "email": "...", "password": "..." }`
  - Response expected: `{ "token": "..." }` (stored in localStorage key `jwt_token`)
- All other endpoints follow your controllers paths (`/users`, `/managers`, `/requests`, etc.)

## Notes
- This scaffold uses plain objects (`any`) everywhere (no interfaces/models).
- Token is attached to outgoing HTTP requests via an interceptor.
- Routes are protected with `AuthGuard`.
- Simple components provided: Login, Dashboard, Users, Managers, Requests.
- To adapt for roles (manager/user), parse JWT in `auth.service.ts.getUserFromToken()` and add checks.

If you want, I can also generate server stubs or provide a ready-to-run Docker environment.  
