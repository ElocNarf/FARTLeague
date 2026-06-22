import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getMyToken } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [myLeagues, setMyLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = getMyToken();
      const { data } = await supabase
        .from('members')
        .select('league_id, is_composer, leagues(id, name, type, invite_code)')
        .eq('browser_token', token);
      setMyLeagues(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="page">
      <div className="app-header">
        <div className="logo">F.A.R.T. <span>League</span></div>
      </div>

      <div style={{ marginBottom: 48 }}>
        <div className="eyebrow">Fantasy Audio Rhythm & Tunes</div>
        <h1>The music league<br />your friends need</h1>
        <p className="muted" style={{ marginTop: 12, fontSize: '1.05rem' }}>
          Nominate new releases, vote on what slaps, and settle who actually has the best taste.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 40 }}>
        <button className="btn btn-primary btn-full" onClick={() => navigate('/create')}>
          🎵 Start a League
        </button>
        <button className="btn btn-secondary btn-full" onClick={() => {
          const code = prompt('Enter your invite code:');
          if (code) navigate(`/join/${code.trim().toLowerCase()}`);
        }}>
          🎧 Join a League
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : myLeagues.length > 0 ? (
        <>
          <h2>Your Leagues</h2>
          {myLeagues.map(m => (
            <div
              key={m.league_id}
              className="card-tight"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => navigate(`/league/${m.league_id}`)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{m.leagues?.name}</div>
                <div className="muted" style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {m.leagues?.type} league
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.is_composer && <span className="badge badge-green">Composer</span>}
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}
