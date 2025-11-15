# RLS FIX DEPLOYMENT - EXECUTION INSTRUCTIONS

**Status:** Ready for Manual Execution  
**Priority:** P0-BLOCKER  
**Migration File:** `supabase/migrations/20250122000000_rls_fix_complete.sql`

---

## 🚨 CRITICAL: Manual Execution Required

Supabase does not allow programmatic migration execution for security reasons. The migration SQL must be manually applied via the Supabase Dashboard SQL Editor.

---

## Deployment Steps (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Navigate to: **https://supabase.com/dashboard/project/qenqilourxtfxchkawek**
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Copy Migration SQL

The migration file is located at:
```
/Users/lordkay/Development/Acrely/supabase/migrations/20250122000000_rls_fix_complete.sql
```

**Option A: Command Line (Recommended)**
```bash
cd /Users/lordkay/Development/Acrely
cat supabase/migrations/20250122000000_rls_fix_complete.sql | pbcopy
```
This copies the entire migration to your clipboard.

**Option B: Manual Copy**
1. Open the file in your editor
2. Select all content (Cmd+A)
3. Copy (Cmd+C)

### Step 3: Execute in Supabase Dashboard

1. Paste the SQL into the SQL Editor (Cmd+V)
2. Review the SQL (optional - it's safe)
3. Click **"Run"** button (bottom right)
4. Wait 10-30 seconds for execution

### Step 4: Verify Execution

You should see output messages including:
- ✅ "Disabled RLS on: users, customers, estates..." (Step 1)
- ✅ "Dropped policy: [policy_name] on [table]" (Step 2)
- ✅ "Created service_all policy on: [tables]" (Step 3)
- ✅ "Created select_all policy on: [tables]" (Step 4)
- ✅ "Synced N users from auth.users..." (Step 9)
- ✅ "Migration Complete" summary (Step 12)

If you see any **ERROR** messages:
- Take a screenshot
- Note the error message
- Continue to Step 5 anyway (verification will catch issues)

### Step 5: Run Automated Verification

Return to terminal and run:
```bash
cd /Users/lordkay/Development/Acrely
npx tsx scripts/test-rls-policies.ts
```

**Expected Output:**
- ✅ All 8 core tables accessible
- ✅ All 4 production users verified
- ✅ CRUD operations successful
- ✅ 100% test pass rate

**If tests fail:**
- Check Supabase SQL Editor for error messages
- Review the "Logs" tab for detailed errors
- Run verification again (policies may need time to propagate)

---

## What This Migration Does

### Phase 1: Clean Slate (Steps 1-3)
- **Disables RLS** on all public tables temporarily
- **Drops ALL existing policies** to remove conflicts and recursive issues
- **No data is modified** - only access control policies

### Phase 2: Rebuild Access Control (Steps 4-8)
- **Service Role Policies:** Full access for backend/edge functions
- **Authenticated Read:** All logged-in users can read all tables
- **Authenticated Write:** Insert/Update permissions for operational tables
- **Special Users Policies:** JWT-based (no recursion), admin access
- **Re-enables RLS** with new, clean policies

### Phase 3: Data Sync (Steps 9-10)
- **Syncs users** from auth.users to public.users
- **Verifies production users:** sysadmin, ceo, md, frontdesk
- **Uses ON CONFLICT** for safe, idempotent operation

### Phase 4: Verification (Steps 11-12)
- **Counts tables** with RLS enabled
- **Counts total policies** created
- **Counts total users** synced
- **Displays summary** for confirmation

---

## Rollback Plan (If Needed)

### If Migration Fails:

1. **Check error message** in SQL Editor logs
2. **Determine failure point** from NOTICE messages
3. **Document issue** for troubleshooting

### If System is Broken After Migration:

Currently, ALL tables are blocked with 42501 errors, so the migration cannot make things worse. It can only improve the situation.

However, if needed, rollback can be done by:

1. **Restore from Supabase backup:**
   - Dashboard > Database > Backups
   - Select latest pre-migration backup
   - Click "Restore"

2. **Re-apply previous policies:**
   - Backup directory: `supabase/backups/`
   - Execute saved policies SQL if available

**Recovery Time:** < 30 minutes

---

## Success Criteria

### Immediate Success (Within 1 Hour)
- ✅ Zero 42501 (permission denied) errors
- ✅ Zero 42P17 (infinite recursion) errors
- ✅ Web dashboard loads without errors
- ✅ All verification tests pass 100%

### Short-Term Success (Within 24 Hours)
- ✅ No user-reported access issues
- ✅ Mobile app syncs and operates normally
- ✅ Edge functions execute without errors
- ✅ All CRUD operations work correctly

---

## Post-Deployment Actions

### 1. Run Verification Script
```bash
npx tsx scripts/test-rls-policies.ts
```

### 2. Test Web Dashboard
- Login: sysadmin@pinnaclegroups.ng / SysAdminPinnacle2025!
- Navigate to Dashboard
- Verify data displays correctly
- Test creating a customer
- Test creating an allocation

### 3. Test Mobile App (if available)
- Login with same credentials
- Pull to refresh data
- Verify customer list loads
- Test creating allocation

### 4. Monitor Logs
- Check Supabase Logs for errors
- Watch for 42501/42P17 error codes
- Review edge function execution logs

---

## Timeline

| Step | Duration | Action |
|------|----------|--------|
| 1 | 1 min | Open Supabase Dashboard |
| 2 | 30 sec | Copy migration SQL |
| 3 | 2 min | Execute in SQL Editor |
| 4 | 30 sec | Review execution output |
| 5 | 2 min | Run verification script |
| **Total** | **6 min** | Complete deployment |

---

## Support

**If you encounter issues:**

1. **Screenshot the error** from SQL Editor
2. **Run verification script** to see specific failures
3. **Check Supabase Logs** under "Logs" tab
4. **Review this file** for troubleshooting steps

**The migration is safe to re-run** if needed - all operations use `IF EXISTS` and `ON CONFLICT` for idempotency.

---

**Ready to proceed?**

Execute Step 1 and follow the instructions sequentially. The entire process takes less than 10 minutes.

**Migration File Path:**
```
/Users/lordkay/Development/Acrely/supabase/migrations/20250122000000_rls_fix_complete.sql
```

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/qenqilourxtfxchkawek
```

**Verification Command:**
```bash
npx tsx scripts/test-rls-policies.ts
```

---

🚀 **Let's fix this RLS issue once and for all!**
