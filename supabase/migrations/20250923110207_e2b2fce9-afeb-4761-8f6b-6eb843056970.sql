-- Create admin_roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_roles
CREATE POLICY "Super admins can view all admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all admin roles" 
ON public.admin_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
  )
);

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(user_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is any kind of admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid 
    AND role IN ('super_admin', 'admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create admin activity log table
CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for activity log
CREATE POLICY "Admins can view activity log" 
ON public.admin_activity_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert activity log" 
ON public.admin_activity_log 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()) AND admin_id = auth.uid());