# Watch Anime verification

- A standalone headless browser fixture with mock history and approximate theme variables was inspected at 375 px. The initially disabled search button now appears distinct and the page had no horizontal overflow; the Desktop flow test passed. No provider, playback or native Hermes Desktop was used.

Development checks on2026-11-05. No public submission or release.

## Passed

- Hermes catalog validator: manifest, clean import, all7 registered tools,
  declared capabilities, security scan and public Desktop SDK surface. No warnings.
- Hermes Plugin Doctor: actual runtime discovery, parsing, import and registration.
- Eleven Python checks in the Hermes runtime: title selection, quality fallback,
  unsafe input rejection, non-public URL rejection, per-profile storage,
  completion-aware resume, inert registration, real mpv playback and controls,
  and FastAPI route dispatch/error handling.
- Original generated5-second video in headless mpv: actual position advance,
  natural EOF/completion, subtitle track selected, pause, exact seek, stop, and
  position persistence. Audio/video outputs were null; no user app was controlled.
- Desktop React/jsdom flow with a fixture backend: search does not autoplay;
  explicit season and episode choice; playback-status rendering; pause dispatch;
  polling cleanup on unmount. This does not establish visual appearance in Hermes.
- Live provider search: four distinct Frieren titles, including separate seasons.
- Live episode list:28 episodes for the selected first season.
- Live resolution:360p,720p,1080p variants and an available subtitle URL.
- Live headless mpv playback: position reached3.88 seconds before deliberate stop;
  no provider media saved. This is a short smoke test, not a full-episode guarantee.

## Remaining

- Actual Hermes Desktop visual integration and a public-demo video.
- Audible/visible user playback review. Headless decoder success alone does not
  establish subjective picture, sound or subtitle quality.
- Native Windows Python 3.14 on the Legion Go loaded the plugin and confirmed
  a search request reports the Linux requirement before provider or player use.
  Windows playback remains unimplemented; no audio or desktop was used.
- Long-session/reboot behavior, provider outages during playback, and dub playback
  against live sources. Offline fixture success does not establish provider uptime.
- Public publication audit (all exposed files/history/artifacts), repository,
  catalog pin/PR, X demo and contest form. None has been published.

Detailed local receipts are outside this package under the contest workspace's
ignored evidence directory. They are not a portable claim about another machine.
- 2026-11-07: live check on this Linux machine through the plugin's own provider code: a search for Frieren returned titles with stable IDs, the first season's episode list loaded, and episode 1 resolved at the requested 720p with no quality fallback. A headless mpv run (no window, null audio output) played the resolved stream to a 7-second position at 1280x720 H.264. No desktop playback, picture or sound review, long playback, Windows, or rights assessment of the sources. Twelve unit tests pass.
