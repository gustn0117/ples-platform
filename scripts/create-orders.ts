import { createClient } from '@supabase/supabase-js'

// Connect to the default 'public' schema to create a function that creates the table
const supabasePublic = createClient('https://api.hsweb.pics', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.xTNteRFphY3F9W2PPWOwCQ9PDXD05ySRqkJu5d4Cej0')

async function main() {
  // First create a helper function to execute DDL
  const { error: fnError } = await supabasePublic.rpc('create_ples_orders_table', {})
  if (fnError) {
    console.log('RPC not found, trying different approach...')
    
    // Try to use the haram schema (default) to create an exec function
    const { data, error } = await supabasePublic.rpc('exec_ddl', { 
      sql_text: `CREATE TABLE IF NOT EXISTS ples_platform.orders (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        user_id TEXT,
        order_type TEXT NOT NULL,
        item_id INTEGER,
        item_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        points_amount INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_key TEXT,
        payment_method TEXT,
        receipt_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}'
      )`
    })
    
    if (error) {
      console.log('exec_ddl also not found:', error.message)
      console.log('')
      console.log('=== MANUAL SQL NEEDED ===')
      console.log('Please run the following SQL in Supabase Studio or psql:')
      console.log('')
      console.log(`CREATE TABLE IF NOT EXISTS ples_platform.orders (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id TEXT,
  order_type TEXT NOT NULL,
  item_id INTEGER,
  item_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  points_amount INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_key TEXT,
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

GRANT ALL ON ples_platform.orders TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';`)
    } else {
      console.log('Table created successfully!')
    }
  }
}

main()
