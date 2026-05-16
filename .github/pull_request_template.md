## Scope

- Milestone:
- Feature/domain:
- Intentionally unchanged:

## Behavior Lock

- [ ] Unit tests added/updated or existing coverage identified
- [ ] Targeted E2E run when UI/API wiring changed
- [ ] No unapproved product behavior change

## Security Check

- [ ] Protected APIs still verify `auth_session` server-side
- [ ] Admin APIs still use verified email allowlist checks
- [ ] `user_email` remains metadata only

## Validation

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e:smoke` or targeted E2E reason noted

## Docs And Risk

- [ ] Relevant docs/decision entries updated
- [ ] Remaining risks or follow-up branches noted
