import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getMyToken } from '../lib/supabase';

export default function CreateLeague() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    type: 'singles',
    round_duration_days: 7,
    composerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.composerName.trim()) {
      setError('Fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    const token = getMyToken();

    // Create league
    const { data: league, error: leagueErr } = await supabase
      .from('leagues')
      .insert({
        name: form.name.trim(),
        type: form.type,
        round_duration_days: Number(form.round_duration_days),
        composer_token: token,
      })
      .select()
      .single();

    if (leagueErr) { setError(leagueErr.message); setLoading(false); return; }

    // Add composer as member
    await supabase.from('members').insert({
      league_id: league.id,
      display_name: form.composerName.trim(),
      browser_token: token,
      is_composer: true,
    });

    // Create first round
    await supabase.from('rounds').insert({
      league_id: league.id,
      round_number: 1,
      status: 'nominating',
      opens_at: new Date().toISOString(),
    });

    navigate(`/league/${league.id}`);
  }

  const typeDescriptions = {
    singles: 'Each member nominates one single. Point budget = number of members.',
    showcase: 'Each member picks 2–3 tracks from a new album. Budget scales with total tracks.',
    album: 'Each member nominates a full album. Budget = total tracks across all albums.',
  };

  return (
    <div className="page">
      <div className="app-header">
        <div className="logo">F.A.R.T. <span>League</span></div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>← Back</button>
      </div>

      <div className="eyebrow">New League</div>
      <h1 style={{ marginBottom: 32 }}>Set the stage</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label>League Name</label>
          <input
            placeholder="e.g. The Vinyl Vault"
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Your Display Name (Composer)</label>
          <input
            placeholder="What should your crew call you?"
            value={form.composerName}
            onChange={e => set('composerName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>League Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="singles">Singles</option>
            <option value="showcase">Showcase</option>
            <option value="album">Album</option>
          </select>
          <div className="alert alert-info" style={{ marginTop: 10, marginBottom: 0 }}>
            {typeDescriptions[form.type]}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Round Duration</label>
          <select value={form.round_duration_days} onChange={e => set('round_duration_days', e.target.value)}>
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>7 days (recommended)</option>
            <option value={14}>14 days</option>
          </select>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create League →'}
      </button>
    </div>
  );
}
