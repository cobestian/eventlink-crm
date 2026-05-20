import { supabase } from '../config/supabase'

export const initializePayment = ({ email, amount, eventTitle, onSuccess, onClose }) => {
  const handler = window.PaystackPop.setup({
    key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Paystack uses pesewas/kobo
    currency: 'GHS',
    ref: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    metadata: { event_title: eventTitle },
    callback: (response) => {
      onSuccess(response.reference)
    },
    onClose: () => {
      if (onClose) onClose()
    }
  })
  handler.openIframe()
}

export const savePayment = async ({ attendeeId, eventId, amount, reference }) => {
  const { data, error } = await supabase.from('payments').insert({
    attendee_id: attendeeId,
    event_id: eventId,
    amount,
    reference,
    status: 'success'
  }).select().single()
  if (error) throw error
  return data
}

export const getAttendeePayments = async (attendeeId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*, events(title, event_date, venue)')
    .eq('attendee_id', attendeeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const hasPayedForEvent = async (attendeeId, eventId) => {
  const { data } = await supabase
    .from('payments')
    .select('id')
    .eq('attendee_id', attendeeId)
    .eq('event_id', eventId)
    .eq('status', 'success')
    .single()
  return !!data
}