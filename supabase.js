import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mxbzarnozfzloysjrudy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Ynphcm5vemZ6bG95c2pydWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDA2NDYsImV4cCI6MjA5NzcxNjY0Nn0.EWNgHzTDP4fOXG46DmdUp3SklLDWmgRKwKjtkjaLTnE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get or create browser identity token
export function getMyToken() {
  let token = localStorage.getItem('fart_league_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('fart_league_token', token);
  }
  return token;
}

// Get member record for current user in a league
export async function getMyMember(leagueId) {
  const token = getMyToken();
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('league_id', leagueId)
    .eq('browser_token', token)
    .single();
  return data;
}

// Check if a release date is within the last 14 days
export function isEligibleRelease(dateStr) {
  const release = new Date(dateStr);
  const now = new Date();
  const diffMs = now - release;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 14;
}

// Compute total track count for a round (used for point budgets)
export async function getRoundTrackTotal(roundId) {
  const { data } = await supabase
    .from('nominations')
    .select('track_count')
    .eq('round_id', roundId);
  if (!data) return 0;
  return data.reduce((sum, n) => sum + n.track_count, 0);
}

// Get total points a member has spent in a round
export async function getMySpentPoints(roundId, memberId) {
  const { data } = await supabase
    .from('votes')
    .select('points')
    .eq('round_id', roundId)
    .eq('member_id', memberId);
  if (!data) return 0;
  return data.reduce((sum, v) => sum + v.points, 0);
}
