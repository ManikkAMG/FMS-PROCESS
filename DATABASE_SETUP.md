# Database Setup Instructions

Your Flow Management System is now configured to use Supabase for data persistence!

## Step 1: Run the Database Migration

1. Go to your Supabase dashboard: https://kuqmnfcdzcshvshlozuj.supabase.co

2. Navigate to the **SQL Editor** section in the left sidebar

3. Open the file `supabase-schema.sql` in this project directory

4. Copy all the SQL content from that file

5. Paste it into the SQL Editor in your Supabase dashboard

6. Click **Run** to execute the migration

This will create:
- `users` table with default users (including admin)
- `fms_templates` table for workflow templates
- `fms_steps` table for template steps
- `projects` table for project instances
- `project_tasks` table for individual tasks
- `activity_logs` table for system logs

## Step 2: Verify the Setup

After running the migration, you should be able to:

1. **Login** with any of these default accounts:
   - Username: `admin`, Password: `fms2024` (Administrator)
   - Username: `john_sales`, Password: `fms2024` (Sales Department)
   - Username: `jane_marketing`, Password: `fms2024` (Marketing Department)
   - Username: `bob_engineering`, Password: `fms2024` (Engineering Department)
   - Username: `alice_finance`, Password: `fms2024` (Finance Department)
   - Username: `charlie_hr`, Password: `fms2024` (HR Department)

2. **Create FMS Templates**: Design workflow templates with multiple steps

3. **Start Projects**: Create new projects based on FMS templates

4. **Manage Tasks**: View and update task status in the dashboard

5. **View Logs**: Track all system activities

6. **Manage Users**: Add new users with different departments and roles

## Troubleshooting

If you encounter any database errors:

1. **Check Tables**: In Supabase dashboard, go to **Table Editor** and verify all tables are created

2. **Check Policies**: In **Authentication > Policies**, verify RLS policies are enabled

3. **Check Data**: Verify default users exist in the `users` table

4. **Connection Issues**: Verify your `.env` file has the correct credentials:
   ```
   VITE_SUPABASE_URL=https://kuqmnfcdzcshvshlozuj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## What Changed

Your application has been migrated from Google Apps Script to Supabase:

- **Old**: Used Google Sheets as database via Apps Script API
- **New**: Uses Supabase PostgreSQL database with direct client connections
- **Benefits**:
  - Faster performance
  - Real-time capabilities
  - Better security with Row Level Security
  - No external API dependencies
  - Full SQL database features

The application is now fully functional and ready to use!
