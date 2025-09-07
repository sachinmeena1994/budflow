
-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'viewer');
CREATE TYPE work_type AS ENUM ('harvest', 'machine', 'hand', 'breakdown');
CREATE TYPE field_type AS ENUM ('text', 'number', 'select', 'dropdown', 'date', 'time');
CREATE TYPE data_type AS ENUM ('string', 'number', 'boolean', 'date');

-- Create roles table
CREATE TABLE public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    permissions JSONB DEFAULT '{}',
    work_type_access TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table  
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES public.roles(id),
    work_type_access TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reference tables
CREATE TABLE public.sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.strains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_name TEXT NOT NULL,
    strain_id UUID REFERENCES public.strains(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create work type fields table
CREATE TABLE public.work_type_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_type TEXT NOT NULL,
    field_key TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    data_type TEXT NOT NULL,
    options JSONB DEFAULT '{}',
    calculated BOOLEAN DEFAULT false,
    required BOOLEAN DEFAULT false,
    field_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create entries table
CREATE TABLE public.entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id TEXT NOT NULL,
    work_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB DEFAULT '{}',
    new_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create work type change logs table
CREATE TABLE public.work_type_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB DEFAULT '{}',
    new_data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_type_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_type_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin permissions
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id 
    AND r.permissions->>'canAccessAll' = 'true'
  );
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for entries table
CREATE POLICY "Users can view their own entries" ON public.entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" ON public.entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.entries
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all entries" ON public.entries
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for reference tables (public read)
CREATE POLICY "Allow read access to sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Allow read access to technicians" ON public.technicians FOR SELECT USING (true);
CREATE POLICY "Allow read access to strains" ON public.strains FOR SELECT USING (true);
CREATE POLICY "Allow read access to batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow read access to work_type_fields" ON public.work_type_fields FOR SELECT USING (true);

-- RLS Policies for roles table
CREATE POLICY "Allow read access to roles" ON public.roles FOR SELECT USING (true);

-- RLS Policies for audit logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for work type logs
CREATE POLICY "Users can view their own work type logs" ON public.work_type_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all work type logs" ON public.work_type_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Insert sample data
INSERT INTO public.roles (label, permissions, work_type_access) VALUES
('Admin', '{"canAccessAll": true, "canCreateEntries": true, "canEditEntries": true, "canDeleteEntries": true}', '{"harvest", "machine", "hand", "breakdown"}'),
('Manager', '{"canAccessAll": false, "canCreateEntries": true, "canEditEntries": true, "canDeleteEntries": false}', '{"harvest", "machine", "hand", "breakdown"}'),
('Technician', '{"canAccessAll": false, "canCreateEntries": true, "canEditEntries": true, "canDeleteEntries": false}', '{"harvest", "machine", "hand"}'),
('Viewer', '{"canAccessAll": false, "canCreateEntries": false, "canEditEntries": false, "canDeleteEntries": false}', '{"harvest", "machine", "hand", "breakdown"}');

INSERT INTO public.sites (name) VALUES
('Site A - North Field'),
('Site B - South Field'),
('Site C - Greenhouse'),
('Site D - Processing');

INSERT INTO public.technicians (name) VALUES
('John Smith'),
('Sarah Johnson'),
('Mike Wilson'),
('Emily Davis'),
('Robert Brown');

INSERT INTO public.strains (name) VALUES
('Blue Dream'),
('OG Kush'),
('Sour Diesel'),
('White Widow'),
('Purple Haze');

INSERT INTO public.batches (product_name, strain_id) VALUES
('Batch A-001', (SELECT id FROM public.strains WHERE name = 'Blue Dream')),
('Batch B-002', (SELECT id FROM public.strains WHERE name = 'OG Kush')),
('Batch C-003', (SELECT id FROM public.strains WHERE name = 'Sour Diesel'));

-- Insert work type field configurations
INSERT INTO public.work_type_fields (work_type, field_key, label, type, data_type, required, field_order) VALUES
-- Harvest fields
('harvest', 'site', 'Site', 'select', 'string', true, 1),
('harvest', 'technician', 'Technician', 'select', 'string', true, 2),
('harvest', 'strain', 'Strain', 'select', 'string', true, 3),
('harvest', 'quantity', 'Quantity (lbs)', 'number', 'number', true, 4),
('harvest', 'start_time', 'Start Time', 'time', 'string', true, 5),
('harvest', 'end_time', 'End Time', 'time', 'string', true, 6),
('harvest', 'notes', 'Notes', 'text', 'string', false, 7),

-- Machine fields
('machine', 'site', 'Site', 'select', 'string', true, 1),
('machine', 'technician', 'Technician', 'select', 'string', true, 2),
('machine', 'machine_type', 'Machine Type', 'select', 'string', true, 3),
('machine', 'batch', 'Batch', 'select', 'string', true, 4),
('machine', 'input_weight', 'Input Weight (lbs)', 'number', 'number', true, 5),
('machine', 'output_weight', 'Output Weight (lbs)', 'number', 'number', true, 6),
('machine', 'start_time', 'Start Time', 'time', 'string', true, 7),
('machine', 'end_time', 'End Time', 'time', 'string', true, 8),
('machine', 'efficiency', 'Efficiency %', 'number', 'number', false, 9),

-- Hand fields
('hand', 'site', 'Site', 'select', 'string', true, 1),
('hand', 'technician', 'Technician', 'select', 'string', true, 2),
('hand', 'batch', 'Batch', 'select', 'string', true, 3),
('hand', 'input_weight', 'Input Weight (lbs)', 'number', 'number', true, 4),
('hand', 'output_weight', 'Output Weight (lbs)', 'number', 'number', true, 5),
('hand', 'start_time', 'Start Time', 'time', 'string', true, 6),
('hand', 'end_time', 'End Time', 'time', 'string', true, 7),
('hand', 'quality_grade', 'Quality Grade', 'select', 'string', false, 8),

-- Breakdown fields
('breakdown', 'site', 'Site', 'select', 'string', true, 1),
('breakdown', 'technician', 'Technician', 'select', 'string', true, 2),
('breakdown', 'batch', 'Batch', 'select', 'string', true, 3),
('breakdown', 'breakdown_type', 'Breakdown Type', 'select', 'string', true, 4),
('breakdown', 'input_weight', 'Input Weight (lbs)', 'number', 'number', true, 5),
('breakdown', 'flower_weight', 'Flower Weight (lbs)', 'number', 'number', false, 6),
('breakdown', 'trim_weight', 'Trim Weight (lbs)', 'number', 'number', false, 7),
('breakdown', 'waste_weight', 'Waste Weight (lbs)', 'number', 'number', false, 8),
('breakdown', 'start_time', 'Start Time', 'time', 'string', true, 9),
('breakdown', 'end_time', 'End Time', 'time', 'string', true, 10);

-- Update work type fields with options for select fields
UPDATE public.work_type_fields SET options = '{"source": "sites", "valueField": "id", "labelField": "name"}' WHERE field_key = 'site';
UPDATE public.work_type_fields SET options = '{"source": "technicians", "valueField": "id", "labelField": "name"}' WHERE field_key = 'technician';
UPDATE public.work_type_fields SET options = '{"source": "strains", "valueField": "id", "labelField": "name"}' WHERE field_key = 'strain';
UPDATE public.work_type_fields SET options = '{"source": "batches", "valueField": "id", "labelField": "product_name"}' WHERE field_key = 'batch';
UPDATE public.work_type_fields SET options = '{"values": ["Trimmer", "Bucking Machine", "Sorter", "Shaker"]}' WHERE field_key = 'machine_type';
UPDATE public.work_type_fields SET options = '{"values": ["Primary", "Secondary", "Final"]}' WHERE field_key = 'breakdown_type';
UPDATE public.work_type_fields SET options = '{"values": ["A", "B", "C", "D"]}' WHERE field_key = 'quality_grade';

-- Create function to auto-generate task IDs
CREATE OR REPLACE FUNCTION generate_task_id(work_type_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    prefix TEXT;
    counter INTEGER;
    task_id TEXT;
BEGIN
    -- Set prefix based on work type
    CASE work_type_param
        WHEN 'harvest' THEN prefix := 'H';
        WHEN 'machine' THEN prefix := 'M';
        WHEN 'hand' THEN prefix := 'HD';
        WHEN 'breakdown' THEN prefix := 'BD';
        ELSE prefix := 'T';
    END CASE;
    
    -- Get next counter for this work type
    SELECT COALESCE(MAX(CAST(SUBSTRING(task_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.entries
    WHERE work_type = work_type_param;
    
    -- Format task ID
    task_id := prefix || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN task_id;
END;
$$;
