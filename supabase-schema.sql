-- FMS (Flow Management System) Database Schema
-- Run this SQL script in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'user',
  department text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create FMS templates table
CREATE TABLE IF NOT EXISTS fms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fms_name text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create FMS steps table
CREATE TABLE IF NOT EXISTS fms_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fms_id uuid NOT NULL REFERENCES fms_templates(id) ON DELETE CASCADE,
  step_no integer NOT NULL,
  what text NOT NULL,
  who text NOT NULL,
  how text NOT NULL,
  "when" integer DEFAULT 1,
  UNIQUE(fms_id, step_no)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fms_id uuid NOT NULL REFERENCES fms_templates(id),
  project_name text NOT NULL,
  start_date date NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create project tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_no integer NOT NULL,
  what text NOT NULL,
  who text NOT NULL,
  how text NOT NULL,
  planned_due_date date NOT NULL,
  actual_completed_on timestamptz,
  status text DEFAULT 'Pending',
  row_index integer,
  UNIQUE(project_id, step_no)
);

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  fms_id uuid REFERENCES fms_templates(id),
  fms_name text,
  project_id uuid REFERENCES projects(id),
  project_name text,
  step_no integer,
  what text,
  status text,
  created_by text,
  updated_by text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fms_steps_fms_id ON fms_steps(fms_id);
CREATE INDEX IF NOT EXISTS idx_projects_fms_id ON projects(fms_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_who ON project_tasks(who);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fms_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to users" ON users FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update to users" ON users FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete from users" ON users FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access to fms_templates" ON fms_templates FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to fms_templates" ON fms_templates FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read access to fms_steps" ON fms_steps FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to fms_steps" ON fms_steps FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read access to projects" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to projects" ON projects FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read access to project_tasks" ON project_tasks FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to project_tasks" ON project_tasks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update to project_tasks" ON project_tasks FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to activity_logs" ON activity_logs FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert to activity_logs" ON activity_logs FOR INSERT TO public WITH CHECK (true);

-- Insert default users
INSERT INTO users (username, password, name, role, department)
VALUES
  ('admin', 'fms2024', 'System Administrator', 'admin', 'IT'),
  ('john_sales', 'fms2024', 'John Doe', 'user', 'Sales'),
  ('jane_marketing', 'fms2024', 'Jane Smith', 'user', 'Marketing'),
  ('bob_engineering', 'fms2024', 'Bob Johnson', 'user', 'Engineering'),
  ('alice_finance', 'fms2024', 'Alice Williams', 'user', 'Finance'),
  ('charlie_hr', 'fms2024', 'Charlie Brown', 'user', 'HR')
ON CONFLICT (username) DO NOTHING;
