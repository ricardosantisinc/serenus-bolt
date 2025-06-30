/*
  # Sistema de Fotos de Perfil

  1. New Tables
    - `user_photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `image_data` (bytea) - Dados binários da imagem
      - `file_name` (text) - Nome do arquivo
      - `file_type` (text) - Tipo MIME da imagem
      - `file_size` (bigint) - Tamanho do arquivo em bytes
      - `width` (integer) - Largura da imagem
      - `height` (integer) - Altura da imagem
      - `is_active` (boolean) - Se é a foto ativa do usuário
      - `upload_date` (timestamp) - Data do upload
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on user_photos table
    - Add policies for users to manage their own photos
    - Add policies for admins to view company photos
    - Add policies for super admins to view all photos

  3. Functions and Triggers
    - Function to deactivate previous photos when uploading new one
    - Function to update user avatar_url
    - Function for cleanup of old photos
    - Triggers to automate photo management
*/

-- Create user_photos table
CREATE TABLE IF NOT EXISTS user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_data bytea NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image/jpeg', 'image/jpg', 'image/png')),
  file_size bigint NOT NULL CHECK (file_size > 0 AND file_size <= 5242880), -- Max 5MB
  width integer NOT NULL CHECK (width > 0 AND width <= 4000),
  height integer NOT NULL CHECK (height > 0 AND height <= 4000),
  is_active boolean DEFAULT true,
  upload_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_active ON user_photos(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_photos_upload_date ON user_photos(upload_date DESC);

-- Enable RLS
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own photos" ON user_photos;
DROP POLICY IF EXISTS "Users can view their own photos" ON user_photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON user_photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON user_photos;
DROP POLICY IF EXISTS "Admins can view company user photos" ON user_photos;
DROP POLICY IF EXISTS "Super admins can view all user photos" ON user_photos;

-- User photos policies
CREATE POLICY "Users can upload their own photos"
  ON user_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own photos"
  ON user_photos
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own photos"
  ON user_photos
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own photos"
  ON user_photos
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view user photos in their company
CREATE POLICY "Admins can view company user photos"
  ON user_photos
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT u.id FROM users u
      JOIN users admin ON admin.company_id = u.company_id
      WHERE admin.id = auth.uid() 
      AND admin.role IN ('admin', 'hr')
    )
  );

-- Super admins can view all photos
CREATE POLICY "Super admins can view all user photos"
  ON user_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Drop existing functions and triggers if they exist
DROP TRIGGER IF EXISTS trigger_deactivate_previous_photos ON user_photos;
DROP TRIGGER IF EXISTS trigger_update_user_avatar ON user_photos;
DROP FUNCTION IF EXISTS deactivate_previous_photos();
DROP FUNCTION IF EXISTS update_user_avatar();
DROP FUNCTION IF EXISTS cleanup_old_photos();

-- Function to deactivate previous photos when uploading a new one
CREATE OR REPLACE FUNCTION deactivate_previous_photos()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new photo is active, deactivate all other photos for this user
  IF NEW.is_active = true THEN
    UPDATE user_photos 
    SET is_active = false, updated_at = now()
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically deactivate previous photos
CREATE TRIGGER trigger_deactivate_previous_photos
  AFTER INSERT OR UPDATE ON user_photos
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION deactivate_previous_photos();

-- Function to update avatar_url in users table
CREATE OR REPLACE FUNCTION update_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's avatar_url to reference the new photo
  IF NEW.is_active = true THEN
    UPDATE users 
    SET 
      avatar_url = CONCAT('/api/user-photos/', NEW.id),
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user avatar when photo is activated
CREATE TRIGGER trigger_update_user_avatar
  AFTER INSERT OR UPDATE ON user_photos
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION update_user_avatar();

-- Function to clean up orphaned photos (older than 30 days and not active)
CREATE OR REPLACE FUNCTION cleanup_old_photos()
RETURNS void AS $$
BEGIN
  DELETE FROM user_photos 
  WHERE is_active = false 
  AND upload_date < (CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Note: Scheduled cleanup job would be configured in deployment
-- SELECT cron.schedule('cleanup-old-photos', '0 2 * * *', 'SELECT cleanup_old_photos();');