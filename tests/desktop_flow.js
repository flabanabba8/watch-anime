import { act } from 'react'
import { createRoot } from 'react-dom/client'
import plugin from '../desktop/plugin.js'

export async function run(assert, document) {
  const contributions = []
  const calls = []
  const ctx = {
    register: c => contributions.push(c),
    rest: async (_, { body }) => {
      calls.push(body)
      switch (body.operation) {
        case 'anime_history': return { history: [] }
        case 'anime_search': return { results: [{ id: 'original-season-123', title: 'Original Story — Season One' }] }
        case 'anime_episodes': return { episodes: [{ id: '10', number: '1' }, { id: '11', number: '2' }] }
        case 'anime_play': return { id: 'a'.repeat(32), state: 'playing', episode: body.arguments.episode, detail: { title: 'Original Story' } }
        case 'anime_control': return { acknowledged: true }
        case 'anime_status': return { id: 'a'.repeat(32), state: 'playing', episode: '2', detail: {} }
        default: throw Error('Unexpected operation')
      }
    }
  }
  plugin.register(ctx)
  const page = contributions.find(c => c.area === 'routes')
  assert.equal(page.data.path, '/watch-anime')
  const root = createRoot(document.getElementById('root'))
  const change = async (element, value) => act(async () => {
    const proto = element.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLSelectElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, value)
    element.dispatchEvent(new window.Event(element.tagName === 'INPUT' ? 'input' : 'change', { bubbles: true }))
  })
  const click = async label => act(async () => {
    const button = [...document.querySelectorAll('button')].find(e => e.textContent === label)
    assert.ok(button, `Missing button: ${label}`)
    assert.ok(!button.disabled, `Disabled button: ${label}`)
    button.click()
  })
  try {
    await act(async () => root.render(page.render()))
    await change(document.querySelector('input'), 'Original')
    await act(async () => document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })))
    assert.match(document.body.textContent, /Original Story — Season One/)
    assert.equal(calls.filter(c => c.operation === 'anime_play').length, 0, 'Search must never start playback')
    await click('Choose season')
    await change(document.querySelector('select'), '2')
    await click('Play in mpv')
    const play = calls.find(c => c.operation === 'anime_play')
    assert.equal(play.arguments.identifier, 'original-season-123')
    assert.equal(play.arguments.episode, '2')
    assert.match(document.querySelector('[role=status]').textContent, /playing/)
    await click('Pause')
    assert.equal(calls.at(-1).arguments.action, 'pause')
  } finally { await act(async () => root.unmount()) }
  return { passed: true, checks: ['search without autoplay', 'exact season selection', 'episode selection', 'play status', 'pause dispatch', 'unmount cleanup'] }
}
