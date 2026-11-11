# Watch Anime

Find the exact anime season, choose an episode, and continue where you actually
stopped watching. Uses ani-cli's pinned provider code and local mpv playback.

**At a glance**

- **Install:** `hermes plugins install flabanabba8/watch-anime`, then `hermes plugins enable watch-anime`.
- **Needs:** Hermes 0.22 or later, Linux, mpv, and the pinned ani-cli provider script included in this repository.
- **Internet:** It contacts anime streaming sites through ani-cli provider code to search and resolve streams on demand. Nothing is downloaded or stored beyond your watch position.
- **Limits:** Linux only. The sites serve content whose licensing you must judge; the plugin does not host or verify any of it. Site changes can break search or playback.
- **Credits:** Uses ani-cli by pystardust (pinned to a specific commit, see UPSTREAM.json) and mpv. Licence: GPL-3.0-only.
- **AI assistance:** Written with AI coding assistants (Anthropic Claude and OpenAI Codex agents) under the maintainer's direction; what was actually tested is listed in VERIFICATION.md.

## Use from Hermes

- “Search for Frieren.” Hermes shows matching titles with stable IDs.
- “Show the episodes for that season.”
- “Play episode 1, subtitled, at 720p.”
- “Pause it.” / “Seek to120 seconds.” / “Stop.”
- “Continue watching.” An unfinished episode resumes five seconds before the
  saved position. A naturally completed episode advances to the next listed one.

Ambiguous titles are selected by ID, never by assuming the first search hit is
the intended season. Requested quality chooses the highest available variant
at or below that height, or the lowest if none fits; any fallback is reported.
Resume always resolves a fresh stream instead of reusing expired signed URLs.

## Install and requirements

This development version supports **Linux**. Required: Python 3.11+, a POSIX `sh`,
sed/base64/od and mpv. Install dependencies through your package manager; the
plugin does not install or update software. On Windows the tools report the
Linux requirement before contacting the provider or launching a player; Windows
playback is not implemented.

Install the `watch-anime` directory through Hermes's normal local plugin flow.
There are no Python package dependencies, credentials or private server settings.
The unified Desktop half adds a Watch Anime page with search, season/episode
selection, quality/audio controls, playback status and continue-watching cards.
Enable the Python plugin and its Desktop half through Hermes's normal controls.
The UI uses only the public plugin SDK and the host-authenticated backend routes.

The player opens on the computer running Hermes, including when a request comes
from a messaging gateway. It does not stream video into a remote chat client.
Do not launch it over a game/VR session without the user's instruction.

## Stored state and playback

Each active Hermes profile owns its SQLite title library, watch progress and
session receipts under `plugin-data/watch-anime/`. Progress is observed from mpv
approximately once a second. A launch is reported as `starting` until the player
loads media. Natural EOF and a position near the end are both needed to mark an
episode watched. Stopping or seeking alone does not mark it complete.

Controls target only this plugin's own private mpv IPC sockets. User mpv configs,
scripts and yt-dlp are disabled. A bounded supervisor persists progress across
Hermes restarts; sessions auto-stop after eight hours. Killing the worker can
leave its player open; status then reports interruption rather than success.

## Provider and failure behavior

The source-only adapter is derived from pystardust/ani-cli v5.1 at the exact
commit in `UPSTREAM.json`. It retains search, episode listing and stream
resolution. Interactive menus, downloads, updates and upstream history writes
are removed. A bounded Python HTTPS fetcher replaces curl and rejects private
destinations, credential-bearing URLs, insecure redirects and oversized bodies.
The local CLI installed on your computer is not modified or required.

Source availability, sub/dub availability and regional access can change.
Cloudflare blocks, missing streams and provider errors are reported without
automatic retries or bypass attempts. A listing is not a guarantee of playback.
Provider operations are serialized per profile and spaced at least one second
after the previous operation finishes; concurrent callers receive a busy result.

## Disclosure and licensing

Network: metadata requests go to hianime.at; episode resolution visits its selected
embed/media hosts. mpv streams video and optional subtitles directly from those
hosts. The public-HTTPS fetcher governs metadata/resolution; it is not a network
sandbox around mpv's own media requests. Searches and viewing requests reach the
provider. No telemetry, cloud account, library upload or autonomous playback.

Runs bundled readable shell provider code and user-installed mpv without a shell
command string. A worker remains alive while playback runs. No global player,
audio or browser settings are changed. Temporary media URLs are kept in private
files only during resolution/playback and excluded from the library/history and
tool results. No media is bundled or downloaded for offline viewing.

GPL-3.0-only; see LICENSE and UPSTREAM.json. Based on ani-cli by pystardust and
contributors and the AniDroid integration. Independent community software, not
affiliated with Nous Research, ani-cli, media providers or rights holders. Use
sources and content you are authorized to access. Public demos should use original
or properly licensed sample media.

## Verification

Run `python3 -m unittest discover -s tests -v` from this directory, or use
`hermes --run-module unittest discover -s tests -v` to include the FastAPI test.
Desktop flow: `node tests/test_desktop.cjs /path/to/hermes-agent/node_modules`
uses Hermes's existing esbuild, React and jsdom development dependencies.
Integration
fixtures use generated original video and headless mpv, not provider episodes.
Live-provider and visible-player results are recorded separately in VERIFICATION.md.
