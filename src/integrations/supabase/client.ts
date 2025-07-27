import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iavfslzyiwdlrtvktnsb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhdmZzbHp5aXdkbHJ0dmt0bnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjMwMDQsImV4cCI6MjA2OTE5OTAwNH0.i47RgeHYpLDnsDbQZn2xqoN7aaPVY8LGNa_WAzbAKEc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)