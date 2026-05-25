import { supabase } from '../config/supabase'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const sendEmail = async ({ to, subject, html, name }) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ to, subject, html, name }),
    })
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Email send error:', err)
  }
}

export const sendWelcomeEmail = async ({ email, fullName, role }) => {
  const roleMessages = {
    organizer: 'You can now create events, hire ushering agencies, and manage attendees.',
    agency: 'You can now receive booking requests, build client relationships, and earn rewards.',
    attendee: 'You can now browse events, register, get QR tickets, and earn badges.',
  }

  await sendEmail({
    to: email,
    name: fullName,
    subject: 'Welcome to EventLink CRM! 🎪',
    html: `
      <h2 style="color:#6C3FF5;font-size:22px;margin-bottom:8px;">Welcome aboard! 🎉</h2>
      <p style="color:#1A1A2E;font-size:15px;line-height:1.6;">
        Your account has been created successfully as a <strong style="color:#6C3FF5;text-transform:capitalize;">${role}</strong>.
      </p>
      <div style="background:#F0F2FF;border-radius:12px;padding:16px;margin:20px 0;">
        <p style="color:#6B7280;font-size:14px;margin:0;">
          ${roleMessages[role] || 'Welcome to EventLink CRM.'}
        </p>
      </div>
      <p style="color:#1A1A2E;font-size:15px;">
        Click the button below to get started.
      </p>
    `
  })
}

export const sendBookingNotificationEmail = async ({ email, name, eventTitle, status, organizerName }) => {
  const isAccepted = status === 'accepted'
  await sendEmail({
    to: email,
    name,
    subject: `Booking ${isAccepted ? 'Accepted' : 'Update'} — ${eventTitle}`,
    html: `
      <div style="background:${isAccepted ? '#D1FAE5' : '#FEE2E2'};border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
        <p style="font-size:32px;margin:0;">${isAccepted ? '✅' : '❌'}</p>
        <p style="font-weight:700;color:${isAccepted ? '#065F46' : '#991B1B'};font-size:16px;margin:8px 0 0;">
          Booking ${status}
        </p>
      </div>
      <p style="color:#1A1A2E;font-size:15px;line-height:1.6;">
        Your booking request for <strong>${eventTitle}</strong> has been <strong>${status}</strong>
        ${organizerName ? ` by ${organizerName}` : ''}.
      </p>
    `
  })
}

export const sendAnnouncementEmail = async ({ email, name, eventTitle, title, message }) => {
  await sendEmail({
    to: email,
    name,
    subject: `📢 ${title} — ${eventTitle}`,
    html: `
      <div style="background:#EDE9FE;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="font-size:13px;color:#6C3FF5;font-weight:700;margin:0 0 4px;text-transform:uppercase;">Announcement</p>
        <p style="font-size:18px;font-weight:800;color:#1A1A2E;margin:0;">${title}</p>
        <p style="font-size:13px;color:#6B7280;margin:4px 0 0;">Event: ${eventTitle}</p>
      </div>
      <div style="background:#F8F9FF;border-radius:12px;padding:20px;border:1px solid #E8EAFF;">
        <p style="color:#1A1A2E;font-size:15px;line-height:1.8;margin:0;">${message}</p>
      </div>
    `
  })
}

export const sendEventReminderEmail = async ({ email, name, eventTitle, eventDate, venue }) => {
  await sendEmail({
    to: email,
    name,
    subject: `⏰ Reminder: ${eventTitle} is coming up!`,
    html: `
      <div style="background:#EDE9FE;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="font-size:40px;margin:0;">⏰</p>
        <p style="font-weight:800;color:#6C3FF5;font-size:18px;margin:8px 0 0;">Event Reminder</p>
      </div>
      <p style="color:#1A1A2E;font-size:15px;line-height:1.6;">
        Don't forget! <strong>${eventTitle}</strong> is coming up soon.
      </p>
      <div style="background:#F8F9FF;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #E8EAFF;">
        <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">📅 <strong style="color:#1A1A2E;">${eventDate}</strong></p>
        <p style="margin:0;font-size:14px;color:#6B7280;">📍 <strong style="color:#1A1A2E;">${venue}</strong></p>
      </div>
      <p style="color:#6B7280;font-size:14px;">Make sure you have your QR ticket ready!</p>
    `
  })
}

export const sendRsvpConfirmationEmail = async ({ email, name, eventTitle, eventDate, venue, rsvpId }) => {
  await sendEmail({
    to: email,
    name,
    subject: `🎟️ Registration Confirmed — ${eventTitle}`,
    html: `
      <div style="background:#D1FAE5;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="font-size:40px;margin:0;">🎟️</p>
        <p style="font-weight:800;color:#065F46;font-size:18px;margin:8px 0 0;">You're registered!</p>
      </div>
      <p style="color:#1A1A2E;font-size:15px;line-height:1.6;">
        Your registration for <strong>${eventTitle}</strong> has been confirmed.
      </p>
      <div style="background:#F8F9FF;border-radius:12px;padding:16px;margin:16px 0;border:1px solid #E8EAFF;">
        <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">📅 <strong style="color:#1A1A2E;">${eventDate}</strong></p>
        <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">📍 <strong style="color:#1A1A2E;">${venue}</strong></p>
        <p style="margin:0;font-size:14px;color:#6B7280;">🎫 Ticket ID: <strong style="color:#6C3FF5;">${rsvpId?.substring(0, 8).toUpperCase()}</strong></p>
      </div>
      <p style="color:#6B7280;font-size:14px;">Open the app to view your QR ticket.</p>
    `
  })
}