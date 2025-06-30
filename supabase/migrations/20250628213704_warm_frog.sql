/*
  # Educational Programs System

  1. New Tables
    - `courses` - Main courses table
    - `modules` - Course modules table
    - `lessons` - Lesson content table
    - `lesson_content` - Content for lessons (text, video, document)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for super_admin access
    - Add policies for viewing published content
*/

-- Create enum types
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_type AS ENUM ('text', 'video', 'document', 'mixed');
CREATE TYPE video_provider AS ENUM ('youtube', 'vimeo');
CREATE TYPE document_type AS ENUM ('pdf', 'doc', 'docx');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  cover_image_url text,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  estimated_duration integer DEFAULT 0, -- in minutes
  created_by uuid REFERENCES users(id),
  tags text[] DEFAULT '{}',
  category text,
  level difficulty_level DEFAULT 'beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  estimated_duration integer DEFAULT 0, -- in minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status publication_status DEFAULT 'draft',
  order_index integer DEFAULT 0,
  content_type content_type DEFAULT 'text',
  estimated_duration integer DEFAULT 15, -- in minutes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lesson content table
CREATE TABLE IF NOT EXISTS lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  order_index integer DEFAULT 0,
  -- Text content
  text_content text,
  -- Video content
  video_title text,
  video_description text,
  video_provider video_provider,
  video_id text,
  video_embed_url text,
  video_thumbnail_url text,
  -- Document content
  document_title text,
  document_description text,
  document_file_name text,
  document_original_file_name text,
  document_type document_type,
  document_size bigint,
  document_url text,
  document_preview_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all content
CREATE POLICY "Super admins can manage all courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all lesson content"
  ON lesson_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Users can view published content
CREATE POLICY "Users can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can view published modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Users can view published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = lessons.module_id
      AND modules.status = 'published'
    )
  );

CREATE POLICY "Users can view lesson content"
  ON lesson_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_content.lesson_id
      AND (
        lessons.status = 'published' OR
        EXISTS (
          SELECT 1 FROM modules
          WHERE modules.id = lessons.module_id
          AND modules.status = 'published'
        )
      )
    )
  );

-- Function to update course stats when lessons change
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
DECLARE
  module_id uuid;
  course_id uuid;
  total_lessons integer;
  total_duration integer;
BEGIN
  -- Get module_id and course_id
  IF TG_TABLE_NAME = 'lessons' THEN
    IF TG_OP = 'DELETE' THEN
      module_id := OLD.module_id;
    ELSE
      module_id := NEW.module_id;
    END IF;
    
    SELECT course_id INTO course_id FROM modules WHERE id = module_id;
  ELSIF TG_TABLE_NAME = 'modules' THEN
    IF TG_OP = 'DELETE' THEN
      course_id := OLD.course_id;
    ELSE
      course_id := NEW.course_id;
    END IF;
  END IF;
  
  -- Update module stats
  IF module_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      COALESCE(SUM(estimated_duration), 0)
    INTO 
      total_lessons,
      total_duration
    FROM lessons
    WHERE module_id = module_id;
    
    UPDATE modules
    SET 
      estimated_duration = total_duration,
      updated_at = now()
    WHERE id = module_id;
  END IF;
  
  -- Update course stats
  IF course_id IS NOT NULL THEN
    SELECT 
      COUNT(*),
      COALESCE(SUM(estimated_duration), 0)
    INTO 
      total_lessons,
      total_duration
    FROM lessons
    JOIN modules ON lessons.module_id = modules.id
    WHERE modules.course_id = course_id;
    
    UPDATE courses
    SET 
      total_lessons = total_lessons,
      estimated_duration = total_duration,
      updated_at = now()
    WHERE id = course_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update stats
CREATE TRIGGER trigger_update_stats_after_lesson_change
  AFTER INSERT OR UPDATE OR DELETE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER trigger_update_stats_after_module_change
  AFTER INSERT OR UPDATE OR DELETE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

-- Storage for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'Course Materials', false);

-- Storage policies
CREATE POLICY "Super admins can manage course materials"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'course-materials' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Users can read course materials"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-materials'
  );