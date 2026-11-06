import { ROUTES_AREA, SIDEBAR_NAV_AREA } from '@hermes/plugin-sdk'
import { createElement as h, useEffect, useState } from 'react'

const card = { padding: 16, border: '1px solid var(--ui-stroke-secondary)', borderRadius: 12, background: 'var(--ui-bg-elevated)' }
const row = { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }
const field = { padding: '8px 12px', border: '1px solid var(--ui-stroke-secondary)', borderRadius: 7, background: 'var(--ui-bg-tertiary)', color: 'var(--ui-text-primary)' }
const clock = seconds => `${Math.floor((seconds || 0) / 60)}:${String(Math.floor((seconds || 0) % 60)).padStart(2, '0')}`

function AnimePage({ ctx }) {
  const [query, setQuery] = useState('')
  const [titles, setTitles] = useState([])
  const [selected, setSelected] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [episode, setEpisode] = useState('')
  const [audio, setAudio] = useState('sub')
  const [quality, setQuality] = useState('720')
  const [history, setHistory] = useState([])
  const [session, setSession] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const call = (operation, args = {}) => ctx.rest('/action', { method: 'POST', body: { operation, arguments: args }, timeoutMs: 180000 })
  const task = async fn => {
    setBusy(true); setError('')
    try { await fn() } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
  }
  useEffect(() => {
    let active = true
    call('anime_history').then(r => active && setHistory(r.history)).catch(e => active && setError(String(e.message || e)))
    return () => { active = false }
  }, [ctx])
  useEffect(() => {
    if (!session?.id || !['starting', 'playing', 'paused'].includes(session.state)) return
    let active = true
    const poll = async () => {
      try {
        const status = await call('anime_status', { session_id: session.id })
        if (active) setSession(status)
        if (!['starting', 'playing', 'paused'].includes(status.state)) {
          const r = await call('anime_history'); if (active) setHistory(r.history)
        }
      } catch (e) { if (active) setError(String(e.message || e)) }
    }
    const timer = setInterval(poll, 2000)
    return () => { active = false; clearInterval(timer) }
  }, [ctx, session?.id, session?.state])
  const button = (label, onClick, extra = {}) => h('button', { style: field, disabled: busy, onClick, ...extra }, label)
  const select = (label, value, change, values) => h('label', { style: { display: 'grid', gap: 5 } }, label,
    h('select', { style: field, value, onChange: e => change(e.target.value), disabled: busy },
      values.map(([v, name]) => h('option', { value: v, key: v }, name))))
  const choose = title => task(async () => {
    const result = await call('anime_episodes', { identifier: title.id })
    setSelected(title); setEpisodes(result.episodes); setEpisode(result.episodes[0]?.number || '')
  })
  return h('main', { style: { maxWidth: 900, margin: 'auto', padding: 28, display: 'grid', gap: 20, color: 'var(--ui-text-primary)' } },
    h('header', null, h('h1', { style: { fontSize: 28, fontWeight: 700 } }, 'Watch Anime'),
      h('p', null, 'Find your season. Pick an episode. Continue where you left off.'),
      h('p', { style: { color: 'var(--ui-text-secondary)', fontSize: 13 } }, 'Playback opens in mpv on the computer running Hermes. Linux development build.')),
    h('form', { style: row, onSubmit: e => { e.preventDefault(); task(async () => {
      const result = await call('anime_search', { query }); setTitles(result.results); setSelected(null); setEpisodes([])
      if (!result.results.length) setError('No matches. Try an English or romaji title.')
    }) } },
    h('input', { style: { ...field, flex: 1, minWidth: 200 }, 'aria-label': 'Anime title', placeholder: 'Search anime…', value: query,
      maxLength: 160, onChange: e => setQuery(e.target.value) }), button(busy ? 'Working…' : 'Search', undefined, { type: 'submit', disabled: busy || !query.trim() })),
    error && h('div', { role: 'alert', style: { ...card, borderColor: 'var(--ui-red)' } }, error),
    h('section', { 'aria-label': 'Search results', style: { display: 'grid', gap: 10 } }, titles.map(title =>
      h('article', { key: title.id, style: { ...card, ...row, justifyContent: 'space-between' } },
        h('strong', null, title.title), button('Choose season', () => choose(title), { 'aria-label': 'Choose ' + title.title })))),
    selected && h('section', { style: card, 'aria-label': 'Episode selection' }, h('h2', null, selected.title),
      h('div', { style: row }, select('Episode', episode, setEpisode, episodes.map(e => [e.number, 'Episode ' + e.number])),
        select('Audio', audio, setAudio, [['sub', 'Subtitled'], ['dub', 'Dubbed']]),
        select('Quality', quality, setQuality, [['360', '360p'], ['480', '480p'], ['720', '720p'], ['1080', '1080p'], ['best', 'Best available']]),
        button('Play in mpv', () => task(async () => setSession(await call('anime_play', { identifier: selected.id, episode, audio, quality }))), { disabled: busy || !episode }))),
    session && h('section', { style: card, 'aria-label': 'Current playback' }, h('h2', null, session.detail?.title || 'Playback'),
      h('p', { role: 'status' }, `${session.state} · episode ${session.episode || ''} · ${clock(session.progress?.position)} / ${clock(session.progress?.duration)}`),
      session.detail?.quality_fallback && h('p', null, `Requested quality unavailable. Playing ${session.detail.height}p.`),
      (session.error || session.detail?.error) && h('p', { role: 'alert' }, session.error || session.detail.error),
      ['playing', 'paused'].includes(session.state) && h('div', { style: row },
        ...[['pause', 'Pause'], ['unpause', 'Resume'], ['stop', 'Stop']].map(([action, label]) =>
          button(label, () => task(() => call('anime_control', { session_id: session.id, action })), { key: action })))),
    h('section', { 'aria-label': 'Continue watching', style: { display: 'grid', gap: 10 } }, h('h2', null, 'Continue watching'),
      !history.length && h('p', null, 'Your watched episodes will appear here after playback begins.'),
      ...history.map(item => h('article', { style: { ...card, ...row, justifyContent: 'space-between' }, key: `${item.title_id}/${item.episode}/${item.audio}` },
        h('div', null, h('strong', null, item.title), h('p', null, `Episode ${item.episode} · ${item.audio} · ${item.watched ? 'Completed' : clock(item.position)}`)),
        button(item.watched ? 'Continue series' : 'Resume episode', () => task(async () => {
          const result = item.watched
            ? await call('anime_resume', { identifier: item.title_id, quality })
            : await call('anime_play', { identifier: item.title_id, episode: item.episode, audio: item.audio, quality, resume: true })
          if (result.state === 'caught_up') setError('You have reached the last currently listed episode.'); else setSession(result)
        }))))))
}

export default {
  id: 'watch-anime', name: 'Watch Anime',
  register(ctx) {
    ctx.register({ id: 'page', area: ROUTES_AREA, data: { path: '/watch-anime' }, render: () => h(AnimePage, { ctx }) })
    ctx.register({ id: 'nav', area: SIDEBAR_NAV_AREA, data: { path: '/watch-anime', label: 'Watch Anime', codicon: 'play-circle' } })
  }
}
