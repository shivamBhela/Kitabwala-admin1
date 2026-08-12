# DATABASE SAFETY RULES

**CRITICAL: REAL PRODUCTION DATA IN DEV DATABASE**

The database `newDev` (Neon) contains real project data. It was historically intended as a development instance but became the source of truth for the project during AI-assisted development.

**ABSOLUTELY PROHIBITED ACTIONS:**
Under no circumstances should the following actions be performed on this database:
1. `npx prisma db push` or `prisma migrate reset` or `prisma migrate dev`
2. TRUNCATE, DELETE, or DROP TABLE commands
3. Running any destructive `seed.ts` files that delete existing records.

**PERMITTED ACTIONS:**
- Using Prisma Client for read-only inspection.
- Writing code that connects to the database.
- Careful schema additions that do not drop tables or columns (though migrations should be handled with extreme care by the lead engineer).

**Failure to observe these rules will result in the loss of the original expected data and the AI-generated schema changes.**
