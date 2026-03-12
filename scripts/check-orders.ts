import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://api.hsweb.pics', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.xTNteRFphY3F9W2PPWOwCQ9PDXD05ySRqkJu5d4Cej0', {
  db: { schema: 'ples_platform' }
})

async function main() {
  const { data, error } = await supabase.from('orders').select('id').limit(1)
  console.log('data:', data, 'error:', error?.message || 'none')
}

main()
