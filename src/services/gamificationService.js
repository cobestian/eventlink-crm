import { supabase } from '../config/supabase'

export const getUserGamification = async (userId) => {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export const addPoints = async (userId, pointsToAdd) => {
  const current = await getUserGamification(userId)
  const { error } = await supabase
    .from('gamification')
    .update({ points: current.points + pointsToAdd })
    .eq('user_id', userId)
  if (error) throw error
}

export const updateStreak = async (userId) => {
  const current = await getUserGamification(userId)
  const today = new Date().toISOString().split('T')[0]
  const lastActivity = current.last_activity

  let newStreak = current.streak
  if (lastActivity) {
    const diff = Math.floor(
      (new Date(today) - new Date(lastActivity)) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) newStreak += 1
    else if (diff > 1) newStreak = 1
  } else {
    newStreak = 1
  }

  const newBadges = [...(current.badges || [])]

  if (newStreak >= 7 && !newBadges.includes('streak_7')) {
    newBadges.push('streak_7')
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '🔥 7-Day Streak!',
      body: 'Amazing! You have maintained a 7-day activity streak.',
      type: 'badge_earned',
    })
  }

  if (newStreak >= 30 && !newBadges.includes('streak_30')) {
    newBadges.push('streak_30')
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '💎 30-Day Streak!',
      body: 'Incredible! 30 days of consistent activity.',
      type: 'badge_earned',
    })
  }

  await supabase
    .from('gamification')
    .update({ streak: newStreak, last_activity: today, badges: newBadges })
    .eq('user_id', userId)

  return newStreak
}

export const awardBadge = async (userId, badgeId) => {
  const current = await getUserGamification(userId)
  if (current.badges?.includes(badgeId)) return
  const newBadges = [...(current.badges || []), badgeId]
  await supabase
    .from('gamification')
    .update({ badges: newBadges })
    .eq('user_id', userId)
}

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('gamification')
    .select('*, profiles(full_name, role, organization_name)')
    .order('points', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}