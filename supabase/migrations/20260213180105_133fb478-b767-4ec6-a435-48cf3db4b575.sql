
-- Phase 2: Fix all anonymous-vulnerable policies by changing role from public to authenticated
-- This targets policies on public role that reference auth.uid() but don't have IS NOT NULL check
-- Excludes storage.objects policies (different schema)

DO $$
DECLARE
  pol RECORD;
  create_sql TEXT;
  cmd_clause TEXT;
BEGIN
  FOR pol IN
    SELECT 
      p.schemaname,
      p.tablename,
      p.policyname,
      p.permissive,
      p.cmd,
      p.qual,
      p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.roles = '{public}'
      AND (
        (p.qual IS NOT NULL AND p.qual LIKE '%auth.uid()%')
        OR (p.with_check IS NOT NULL AND p.with_check LIKE '%auth.uid()%')
      )
    ORDER BY p.tablename, p.policyname
  LOOP
    -- Drop the existing policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    
    -- Map cmd
    cmd_clause := CASE pol.cmd
      WHEN 'ALL' THEN 'ALL'
      WHEN 'SELECT' THEN 'SELECT'
      WHEN 'INSERT' THEN 'INSERT'
      WHEN 'UPDATE' THEN 'UPDATE'
      WHEN 'DELETE' THEN 'DELETE'
      ELSE 'ALL'
    END;
    
    -- Build CREATE POLICY statement
    create_sql := format(
      'CREATE POLICY %I ON %I.%I AS %s FOR %s TO authenticated',
      pol.policyname,
      pol.schemaname,
      pol.tablename,
      CASE WHEN pol.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      cmd_clause
    );
    
    -- Add USING clause if present
    IF pol.qual IS NOT NULL THEN
      create_sql := create_sql || ' USING (' || pol.qual || ')';
    END IF;
    
    -- Add WITH CHECK clause if present
    IF pol.with_check IS NOT NULL THEN
      create_sql := create_sql || ' WITH CHECK (' || pol.with_check || ')';
    END IF;
    
    EXECUTE create_sql;
    
    RAISE NOTICE 'Fixed policy: % on %.%', pol.policyname, pol.schemaname, pol.tablename;
  END LOOP;
END $$;
