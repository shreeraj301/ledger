# Ledger

A shared decision and approval record for architects and their homeowner clients.

```bash
npm install
npm run dev
```

A studio signs in at `/sign-in`. Each studio is its own firm. Clients open a private link and never make an account. Run `supabase/migrations/20261014_firms.sql` in the Supabase SQL editor before the first signup.
