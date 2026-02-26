# Supabase Setup Guide

This guide will help you set up Supabase for the Waxity Lead Management application.

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- The environment variables are already configured in `.env`

## Step 1: Create the Leads Table

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (left sidebar)
3. Copy and paste the SQL from `supabase-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `leads` table with all necessary columns
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 2: Verify the Table

1. Navigate to **Table Editor** in your Supabase dashboard
2. You should see the `leads` table
3. Click on it to view the structure

## Step 3: Test the Connection

1. Start your development server: `npm run dev`
2. Sign in as Admin
3. Go to the Leads page and try adding a new lead
4. Go to the Assign Tasks page and try creating a new task

## Table Structures

### Leads Table (`leads`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `lead_id` | TEXT | Unique lead identifier (e.g., LD123456789) |
| `company` | TEXT | Company name |
| `contact` | TEXT | Contact person name |
| `phone` | TEXT | Phone number |
| `email` | TEXT | Email address |
| `city` | TEXT | City |
| `state` | TEXT | State |
| `country` | TEXT | Country |
| `source` | TEXT | Inquiry source (INDIAMART, TRADEINDIA, etc.) |
| `product_interested` | TEXT | Product/service of interest |
| `assigned_to` | TEXT | Assigned sales person |
| `status` | TEXT | Lead status (New, Connected, Interested, etc.) |
| `value` | NUMERIC | Potential deal value |
| `remarks` | TEXT | Additional notes |
| `inquiry_date` | DATE | Date of inquiry |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Tasks Table (`tasks`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `task_id` | TEXT | Unique task identifier (e.g., TSK-123456789) |
| `title` | TEXT | Task title |
| `description` | TEXT | Task description |
| `assigned_to` | TEXT | Assigned sales person |
| `lead_company` | TEXT | Associated lead/company |
| `priority` | TEXT | Priority level (Low, Medium, High, Urgent) |
| `status` | TEXT | Task status (Pending, In Progress, Completed) |
| `due_date` | DATE | Task due date |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Security

Row Level Security (RLS) is enabled on all tables. The current policies allow:
- **SELECT**: All users can read data
- **INSERT**: Authenticated users can add data
- **UPDATE**: Authenticated users can modify data
- **DELETE**: Authenticated users can delete data

You can customize these policies in the Supabase dashboard under **Authentication > Policies**.

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that `.env` file exists in the project root
- Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after changing `.env`

### Error: "Failed to load leads"
- Check your internet connection
- Verify the Supabase project is active
- Check the browser console for detailed error messages
- Ensure the `leads` table was created successfully

### No leads appearing
- Make sure you're signed in as Admin
- Try adding a new lead using the "Add Lead" button
- Check the Supabase Table Editor to see if data is being saved

### No tasks appearing
- Make sure you're signed in as Admin
- Try creating a new task using the "New Task" button
- Check the Supabase Table Editor to see if data is being saved in the `tasks` table

## Implemented Features

✅ **Leads Management**
- Fetch leads from Supabase
- Add new leads (Admin only)
- Update lead status
- Search and filter leads
- Export leads to Excel

✅ **Tasks Management**
- Fetch tasks from Supabase
- Create new tasks (Admin only)
- Update task status (All users)
- Search and filter tasks by status and priority
- Task statistics (pending, in-progress, completed)

## Next Steps

Consider adding these features:
1. Follow-ups table to store follow-up history
2. Users table for authentication
3. Sales team table for team management
4. Clients table integration with Supabase
5. Analytics views for reporting
6. Real-time updates with Supabase subscriptions

## Support

For Supabase-specific issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
