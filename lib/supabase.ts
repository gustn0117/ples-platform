import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://api.hsweb.pics'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.pei5Gx1wqEkbcDs1CiHFuTWNuVRlcrG5dPmYdrAqDdY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'ples_platform' }
})
