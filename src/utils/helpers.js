export const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  return new Date(dateString).toLocaleDateString('en-GH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })
}

export const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-GH', {
    hour: '2-digit', minute: '2-digit'
  })
}

export const getCountdown = (eventDate) => {
  const diff = new Date(eventDate) - new Date()
  if (diff <= 0) return 'Event has passed'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const truncateText = (text, max = 100) => {
  if (!text) return ''
  return text.length > max ? text.substring(0, max) + '...' : text
}