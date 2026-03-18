import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// POST /api/auth - login, signup, find-password, find-email
export async function POST(request: Request) {
  const body = await request.json()
  const { action } = body
  const supabase = createServiceClient()

  if (action === 'signup') {
    const { email, password, nickname, realName, residentNumber, phone } = body
    const trimmedEmail = email.trim().toLowerCase()

    // Check duplicate
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' })
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: trimmedEmail,
        nickname: nickname.trim(),
        password: password.trim(),
        real_name: realName || null,
        resident_number: residentNumber || null,
        phone: phone || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '회원가입에 실패했습니다.' })
    }

    return NextResponse.json({ user: newUser })
  }

  if (action === 'login') {
    const { email, password } = body
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', trimmedEmail)
      .eq('password', trimmedPassword)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    return NextResponse.json({ user })
  }

  if (action === 'find-password') {
    const { email } = body
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (!user) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, password: user.password })
  }

  if (action === 'find-email') {
    const { phone } = body
    const cleaned = phone.replace(/[^0-9]/g, '')
    const { data: users } = await supabase
      .from('users')
      .select('email, phone')

    if (!users) return NextResponse.json({ found: false })
    const found = users.find((u: any) => u.phone?.replace(/[^0-9]/g, '') === cleaned)
    if (!found) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, email: found.email })
  }

  if (action === 'get-user') {
    const { userId } = body
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!user) return NextResponse.json({ error: 'User not found' })
    return NextResponse.json({ user })
  }

  if (action === 'get-all-users') {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({ users: users || [] })
  }

  if (action === 'update-user') {
    const { userId, updates } = body
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) return NextResponse.json({ error: 'Update failed' })
    return NextResponse.json({ success: true })
  }

  if (action === 'delete-user') {
    const { userId } = body
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) return NextResponse.json({ error: 'Delete failed' })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
