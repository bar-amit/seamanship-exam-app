# Staging Smoke Checklist

Last updated: 2026-02-25  
Owner: Bar Amit

Run this after staging deploy + data import.

## Preconditions

- [-] Staging env validated: `npm run validate:env:staging`
- [-] Firestore/Storage rules deployed
- [-] Staging data imported

## Auth and Access

- [-] Home page loads (`/`)
- [-] Google login works
- [-] Logout works
- [-] Protected routes require auth when logged out:
  - `/dashboard`
  - `/collections`
  - `/progress`
- [-] Admin route blocked for non-allowlisted user (`/admin`)
- [-] Admin route accessible for allowlisted user (`/admin`)

## Practice Flows

- [-] Practice test flow (`/practice`):
  - Start test
  - Answer at least one question
  - Enter review
  - New test reset works
- [-] Tag practice flow (`/practice/tags`):
  - Start tag session
  - Toggle study aids
  - Mark reviewed/skipped
- [-] Refresh persistence works in both flows

## Saved Features

- [-] Collections (`/collections`):
  - Create collection
  - Edit collection name/description/question ids
  - Delete collection
- [-] Progress (`/progress`):
  - Shows per-tag stats after tag practice
- [-] Dashboard (`/dashboard`):
  - Shows collections and progress summary

## Admin Editing

- [ ] Search with pagination works
- [ ] Search result preview text shown
- [ ] Edit question text / model answer / tags
- [ ] Edit MCQ options and correct choice id
- [ ] Edit open-text sub-questions
- [ ] JSON toggles (loaded doc + payload) work
- [ ] Save writes update successfully

## Assets and Media

- [ ] Question images render in practice/review
- [ ] Option images render where expected
- [ ] Click image opens modal preview

## Observability

- [ ] No critical errors in browser console
- [ ] Server logs show no repeated auth/session failures

## Sign-off

- [ ] Desktop smoke pass
- [ ] Mobile smoke pass
- [ ] Ready for staging approval
