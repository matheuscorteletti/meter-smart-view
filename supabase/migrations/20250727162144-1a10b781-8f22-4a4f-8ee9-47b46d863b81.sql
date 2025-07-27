-- Fix RLS policies for proper CRUD operations

-- Update meters policies to allow authenticated users to insert/update
DROP POLICY IF EXISTS "Authenticated users can create meters" ON public.meters;
CREATE POLICY "Authenticated users can create meters" 
ON public.meters 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update meters" ON public.meters;
CREATE POLICY "Authenticated users can update meters" 
ON public.meters 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- Allow admins to delete meters
DROP POLICY IF EXISTS "Admins can delete meters" ON public.meters;
CREATE POLICY "Admins can delete meters" 
ON public.meters 
FOR DELETE 
TO authenticated 
USING (get_current_user_role() = 'admin');

-- Fix buildings policies
DROP POLICY IF EXISTS "Authenticated users can create buildings" ON public.buildings;
CREATE POLICY "Authenticated users can create buildings" 
ON public.buildings 
FOR INSERT 
TO authenticated 
WITH CHECK (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Authenticated users can update buildings" ON public.buildings;
CREATE POLICY "Authenticated users can update buildings" 
ON public.buildings 
FOR UPDATE 
TO authenticated 
USING (get_current_user_role() = 'admin');

-- Fix units policies  
DROP POLICY IF EXISTS "Authenticated users can create units" ON public.units;
CREATE POLICY "Authenticated users can create units" 
ON public.units 
FOR INSERT 
TO authenticated 
WITH CHECK (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Authenticated users can update units" ON public.units;
CREATE POLICY "Authenticated users can update units" 
ON public.units 
FOR UPDATE 
TO authenticated 
USING (get_current_user_role() = 'admin');