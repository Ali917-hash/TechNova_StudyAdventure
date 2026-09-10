# TechNova Security Smoke Tests

Run the application locally with `npm run dev` before testing. Use a fresh browser profile or clear `localhost:3000` cookies between sessions.

## Authentication

- Open `/dashboard` while logged out. Expected: redirect to `/login`.
- Open `/profile` while logged out. Expected: redirect to `/login`.
- Open `/admin/dashboard` while logged out. Expected: redirect to `/login`.
- Submit `/login` without `_csrf`. Expected: HTTP `403`.
- Submit `/registration` without `_csrf`. Expected: HTTP `403`.
- Submit invalid login credentials. Expected: controlled failure; no session is created.
- Log in successfully, then submit `/logout`. Expected: redirect and session invalidation.

## Authorization

- Log in as a normal user and open `/admin/dashboard`. Expected: denied or redirected.
- Log in as a normal user and open another user's certificate URL. Expected: HTTP `404`.
- Request another user's course progress URL. Expected: no other user's progress is returned.
- Request course material without an approved enrollment. Expected: HTTP `403`.
- Change a course, enrollment, certificate, or progress ID in the URL. Expected: ownership and role checks still apply.

## CSRF

- Submit each protected form with its rendered `_csrf` field. Expected: request succeeds or reaches normal validation.
- Submit the same form after deleting the `csrf-token` cookie. Expected: HTTP `403`.
- Submit learning-page AJAX actions without `x-csrf-token`. Expected: HTTP `403`.
- Submit contact, enrollment, profile, logout, and admin action forms after a fresh page load. Expected: no CSRF error.

## Uploads

- Upload a disallowed image extension or MIME type. Expected: rejection.
- Upload a file above the configured image limit. Expected: HTTP `413` or controlled upload error.
- Upload course material without admin authorization. Expected: denied before persistence.
- Request `/uploads/course-materials/<file>` directly. Expected: HTTP `403`.

## Headers and CSP

- Inspect a response from `/`. Expected: `Content-Security-Policy` is present.
- Inspect a response from `/`. Expected: `X-Powered-By` is absent.
- Load the home, login, registration, contact, admin, and learning pages. Expected: no CSP console errors.
- Open a PDF in the learning page. Expected: same-origin iframe loads normally.

## Production Configuration

Before deployment:

- Set `NODE_ENV=production`.
- Use unique random secrets of at least 32 characters for `SESSION_SECRET` and `CSRF_SECRET`.
- Rotate MongoDB and mail credentials.
- Serve the site over HTTPS.
- Confirm `.env` is never committed or uploaded.
- Run `npm audit --omit=dev` and resolve high or critical findings.
