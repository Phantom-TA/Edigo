# Database Setup Guide - Fresh Start

## What Was Done

### 1. Packages Uninstalled
The following packages were removed:
- `drizzle-orm`
- `postgres`
- `drizzle-kit`
- `@neondatabase/serverless`
- `@supabase/supabase-js`

### 2. Files Updated

#### `src/app/_configs/db.ts`
- Cleared old configuration
- Added template code (commented out)
- Ready for new PostgreSQL connection

#### `supabaseConfig.ts`
- Cleared old configuration
- Added template code (commented out)
- Ready for new Supabase setup

#### `.env`
- Removed old DATABASE_URL
- Added placeholders for new configuration
- Organized with comments

#### `test-db-connection.ts`
- Commented out old test code
- Added instructions for re-enabling

### 3. Schema Preserved
`src/app/_configs/Schema.ts` remains intact with:
- **CourseList** table definition
- **Chapters** table definition

---

## Next Steps - Setting Up New Database

### Option 1: New Supabase Project (Recommended)

1. **Create New Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose a region closer to you (to avoid timeouts)
   - Note down the project credentials

2. **Install Required Packages**
   ```bash
   npm install drizzle-orm postgres @supabase/supabase-js
   npm install -D drizzle-kit
   ```

3. **Update `.env` File**
   ```env
   # Get these from Supabase Dashboard → Settings → Database
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

   # Get these from Supabase Dashboard → Settings → API
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Uncomment Code in Files**
   - Uncomment code in `src/app/_configs/db.ts`
   - Uncomment code in `supabaseConfig.ts`
   - Uncomment code in `test-db-connection.ts`

5. **Push Schema to Database**
   ```bash
   npm run db:push
   ```

6. **Test Connection**
   ```bash
   npx tsx test-db-connection.ts
   ```

### Option 2: Other PostgreSQL Provider

You can use any PostgreSQL provider:
- **Neon** (https://neon.tech)
- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **AWS RDS**
- **Local PostgreSQL**

Follow similar steps but adjust the connection string format.

---

## Drizzle Configuration

Create or update `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export default {
  schema: "./src/app/_configs/Schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

---

## Troubleshooting

### Connection Timeouts
- Choose a database region closer to your location
- Use direct connection port (5432) instead of pooler (6543)
- Check your firewall/network settings

### Package Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
```bash
# Test with explicit dotenv
npx tsx --require dotenv/config test-db-connection.ts
```

---

## Important Files to Update After Setup

Once you have a working database connection, these files may need updates:
- `src/app/api/test-db/route.ts` - API route for testing
- `src/app/create-course/page.tsx` - Course creation logic
- Any other files that import from `_configs/db.ts`

---

## Contact & Support

If you encounter issues:
1. Check Supabase/Provider dashboard for project status
2. Verify environment variables are set correctly
3. Test network connectivity to database host
4. Review Supabase logs for connection errors
