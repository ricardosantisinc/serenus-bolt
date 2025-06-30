-- Sistema de Checkups DASS-21
-- 
-- 1. New Tables
--   - checkup_results: Armazena resultados dos testes DASS-21
--   - company_checkup_settings: Configurações de periodicidade por empresa
--   - companies: Informações das empresas
--   - users: Usuários do sistema
--
-- 2. Security
--   - Enable RLS on all tables
--   - Add policies for different user roles
--   - Restrict access based on company and role

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  contact_person text NOT NULL,
  corporate_email text NOT NULL,
  landline_phone text,
  mobile_phone text NOT NULL,
  logo_url text DEFAULT '/serenus.png',
  is_active boolean DEFAULT true,
  plan_type text DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  max_users integer DEFAULT 50,
  current_users integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'hr', 'psychologist', 'employee')),
  department text,
  avatar_url text DEFAULT 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
  last_checkup_date date,
  next_checkup_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company checkup settings table
CREATE TABLE IF NOT EXISTS company_checkup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  normal_interval_days integer DEFAULT 90,
  severe_interval_days integer DEFAULT 30,
  auto_reminders_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create checkup results table
CREATE TABLE IF NOT EXISTS checkup_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  responses jsonb NOT NULL,
  scores jsonb NOT NULL,
  classifications jsonb NOT NULL,
  overall_score integer NOT NULL,
  severity_level text NOT NULL CHECK (severity_level IN ('normal', 'leve', 'moderado', 'severo', 'extremamente_severo')),
  next_checkup_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkup_results_user_id ON checkup_results(user_id);
CREATE INDEX IF NOT EXISTS idx_checkup_results_company_id ON checkup_results(company_id);
CREATE INDEX IF NOT EXISTS idx_checkup_results_severity ON checkup_results(severity_level);
CREATE INDEX IF NOT EXISTS idx_checkup_results_date ON checkup_results(created_at);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_next_checkup ON users(next_checkup_date);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_checkup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkup_results ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Super admins can manage all companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Super admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'super_admin'
    )
  );

CREATE POLICY "Admins and HR can manage users in their company"
  ON users
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Managers can view team members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'manager'
    )
  );

-- Company settings policies
CREATE POLICY "Admins can manage company checkup settings"
  ON company_checkup_settings
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('super_admin', 'admin')
    )
  );

-- Checkup results policies
CREATE POLICY "Users can insert their own checkup results"
  ON checkup_results
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own checkup results"
  ON checkup_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins and HR can view all company checkup results"
  ON checkup_results
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'hr')
    )
  );

CREATE POLICY "Psychologists can view checkup results in their company"
  ON checkup_results
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'psychologist'
    )
  );

CREATE POLICY "Managers can view team checkup results"
  ON checkup_results
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT u.id FROM users u
      JOIN users manager ON manager.company_id = u.company_id
      WHERE manager.id = auth.uid() 
      AND manager.role = 'manager'
    )
  );

-- Function to update next checkup date based on severity
CREATE OR REPLACE FUNCTION calculate_next_checkup_date(
  p_company_id uuid,
  p_severity_level text
) RETURNS date AS $$
DECLARE
  settings_record company_checkup_settings;
  interval_days integer;
BEGIN
  -- Get company settings
  SELECT * INTO settings_record 
  FROM company_checkup_settings 
  WHERE company_id = p_company_id;
  
  -- If no settings found, create default ones
  IF NOT FOUND THEN
    INSERT INTO company_checkup_settings (company_id)
    VALUES (p_company_id)
    RETURNING * INTO settings_record;
  END IF;
  
  -- Determine interval based on severity
  IF p_severity_level IN ('severo', 'extremamente_severo') THEN
    interval_days := settings_record.severe_interval_days;
  ELSE
    interval_days := settings_record.normal_interval_days;
  END IF;
  
  RETURN CURRENT_DATE + interval_days;
END;
$$ LANGUAGE plpgsql;

-- Function to get highest severity level from classifications
CREATE OR REPLACE FUNCTION get_highest_severity(classifications jsonb) 
RETURNS text AS $$
DECLARE
  severities text[] := ARRAY['normal', 'leve', 'moderado', 'severo', 'extremamente_severo'];
  max_severity text := 'normal';
  classification_value text;
BEGIN
  -- Check each classification field
  FOR classification_value IN 
    SELECT value::text 
    FROM jsonb_each_text(classifications)
  LOOP
    -- Remove quotes from json text value
    classification_value := TRIM(BOTH '"' FROM classification_value);
    
    -- Find the highest severity
    IF array_position(severities, classification_value) > array_position(severities, max_severity) THEN
      max_severity := classification_value;
    END IF;
  END LOOP;
  
  RETURN max_severity;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate next checkup date and update user
CREATE OR REPLACE FUNCTION update_user_checkup_dates()
RETURNS TRIGGER AS $$
DECLARE
  next_date date;
BEGIN
  -- Calculate next checkup date
  next_date := calculate_next_checkup_date(NEW.company_id, NEW.severity_level);
  
  -- Update the checkup result with next date
  NEW.next_checkup_date := next_date;
  
  -- Update user's checkup dates
  UPDATE users 
  SET 
    last_checkup_date = CURRENT_DATE,
    next_checkup_date = next_date,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checkup_dates
  BEFORE INSERT ON checkup_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_checkup_dates();

-- Insert default settings for existing companies
INSERT INTO company_checkup_settings (company_id)
SELECT id FROM companies
WHERE id NOT IN (SELECT company_id FROM company_checkup_settings WHERE company_id IS NOT NULL)
ON CONFLICT (company_id) DO NOTHING;