import { supabase } from '../config/supabase'

export const getAgencies = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, gamification(*)')
    .eq('role', 'agency')
  if (error) throw error
  return data
}

export const sendBookingRequest = async ({ organizerId, agencyId, eventId, message }) => {
  const { data, error } = await supabase.from('bookings').insert({
    organizer_id: organizerId,
    agency_id: agencyId,
    event_id: eventId,
    message,
  }).select().single()
  if (error) throw error

  await supabase.from('notifications').insert({
    user_id: agencyId,
    title: '🎯 New Booking Request',
    body: 'You have received a new booking request from an organizer.',
    type: 'booking_request',
  })
  return data
}

export const getAgencyBookings = async (agencyId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles!bookings_organizer_id_fkey(full_name, email, phone, organization_name), events(title, event_date, venue)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getOrganizerBookings = async (organizerId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles!bookings_agency_id_fkey(full_name, organization_name), events(title, event_date)')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const updateBookingStatus = async (bookingId, status) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}