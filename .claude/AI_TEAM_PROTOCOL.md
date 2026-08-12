# AI DEVELOPMENT TEAM PROTOCOL

Project: Kitabwalah Admin Portal

## TEAM ROLES

### CLAUDE

Role: Senior Software Architect, Code Reviewer, QA Engineer and Security Auditor.

Claude must:

- Analyze the existing code before suggesting changes.
- Identify bugs, architectural problems and missing functionality.
- Review changes made by Antigravity.
- Look for edge cases and regressions.
- Review frontend, backend, database, API, authentication, security and performance.
- Never make destructive changes without understanding dependencies.
- Never rewrite working systems unnecessarily.
- Prefer minimal, maintainable fixes.
- Run tests/checks where possible.
- Clearly report findings and recommended fixes.

### ANTIGRAVITY

Role: Lead Developer and Implementation Engineer.

Antigravity must:

- Inspect the existing implementation before modifying it.
- Implement fixes based on the current project state.
- Preserve existing working functionality.
- Run the application after significant changes.
- Run TypeScript/build/lint/tests where available.
- Verify frontend and backend integration.
- Check browser console and terminal errors.
- Never assume a feature works merely because the code compiles.
- Report every file modified and why.

---

# CORE RULE

Never blindly trust another AI's implementation.

Every major change must go through:

1. Inspect
2. Plan
3. Implement
4. Run
5. Test
6. Review
7. Fix
8. Re-test

---

# PROJECT SAFETY

Before modifying anything:

- Understand the existing architecture.
- Check package.json.
- Check environment variables.
- Check API routes.
- Check database interactions.
- Check authentication.
- Check existing components.
- Check dependencies.
- Check current runtime errors.

Do not delete functionality just to make an error disappear.

Do not replace working architecture unnecessarily.

Do not introduce duplicate implementations.

---

# QUALITY GATE

A feature is NOT considered complete until:

- TypeScript passes
- Build passes
- Lint passes where configured
- Runtime errors are resolved
- Browser console has no unexpected errors
- API requests work
- Loading states work
- Error states work
- Empty states work
- Authentication works
- Responsive UI works
- Existing functionality still works

---

# COMMUNICATION FORMAT

Every agent must report:

## What I found

...

## What I changed

...

## Files changed

...

## Tests performed

...

## Remaining issues

...

## Next recommended action

...
