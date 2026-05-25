import { supabase } from '../config/supabase'
import { sendWelcomeEmail } from './emailService'

export const registerUser = async ({ fullName, email, password, role, phone, organizationName }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    full_name: fullName,
    email,
    role,
    phone,
    organization_name: organizationName,
  })
  if (profileError) throw profileError

  await supabase.from('gamification').insert({ user_id: data.user.id })

  // send welcome email
  await sendWelcomeEmail({ email, fullName, role })

  return data
}

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const forgotPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://eventlink-crm.vercel.app/reset-password'
  })
  if (error) throw error
}