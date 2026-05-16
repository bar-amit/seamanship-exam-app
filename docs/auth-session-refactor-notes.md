# Auth Session Refactor Notes

Last updated: 2026-05-16  
Owner: Bar Amit

## Source Of Truth

Firebase client auth state is the client-side source of truth for session synchronization. `AuthControls` starts login/logout through Firebase, and the `onAuthStateChanged` listener is the single UI path that creates or clears the server session cookie.

Server APIs remain the authorization source of truth:

- Protected APIs verify `auth_session` server-side.
- Admin APIs verify `auth_session`, then enforce `ADMIN_ALLOWLIST` against the verified email claim.
- Middleware and `user_email` are UX signals only.

## Client Session Boundary

`src/lib/auth/client-session.js` owns browser session synchronization:

- Create server session from a Firebase user ID token.
- Clear server session when Firebase user is signed out.
- Emit the shared auth UI refresh event.

UI components should call these helpers instead of hardcoding `/api/auth/session` fetches or event names.

## Validation

Targeted checks for this slice:

```bash
npm test -- tests/client-session.test.js tests/session.test.js tests/server-session.test.js tests/guard.test.js tests/middleware-policy.test.js
npm run build
```
