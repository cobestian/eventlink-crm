import { supabase } from '../config/supabase'

export const createEvent = async (eventData, organizerId) => {
  const { data, error } = await supabase.from('events').insert({
    ...eventData,
    organizer_id: organizerId,
  }).select().single()
  if (error) throw error

  await supabase.from('notifications').insert({
    user_id: organizerId,
    title: 'Event Created',
    body: `Your event "${eventData.title}" has been published successfully.`,
    type: 'event_created',
  })
  return data
}

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*, profiles(full_name, organization_name)')
    .eq('status', 'published')
    .order('event_date', { ascending: true })
  if (error) throw error
  return data
}

export const getOrganizerEvents = async (organizerId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const updateEvent = async (eventId, updates) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const cancelEvent = async (eventId) => {
  const { error } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)
  if (error) throw error
}

export const rsvpEvent = async (attendeeId, eventId) => {
  const { data, error } = await supabase.from('rsvps').insert({
    attendee_id: attendeeId,
    event_id: eventId,
  }).select().single()
  if (error) throw error
  return data
}

export const getAttendeeRsvps = async (attendeeId) => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, events(*)')
    .eq('attendee_id', attendeeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getEventAttendees = async (eventId) => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, profiles(full_name, email, phone)')
    .eq('event_id', eventId)
  if (error) throw error
  return data
}

export const checkInAttendee = async (rsvpId) => {
  const { error } = await supabase
    .from('rsvps')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', rsvpId)
  if (error) throw error
}

export const deleteEvent = async (eventId) => {
  // Delete related records first
  await supabase.from('rsvps').delete().eq('event_id', eventId)
  await supabase.from('bookings').delete().eq('event_id', eventId)
  await supabase.from('notifications').delete().eq('type', 'announcement')

  // Then delete the event
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
  if (error) throw error
}