# Spotify is the identity

SpotiTools exists to act as a Spotify user. We sign people in with Spotify OAuth only: completing that flow *is* becoming a User. A separate email/password (or other) account would add a second identity we do not need, and every later tool still requires the Spotify grant. Anyone with Spotify can become a User; an allowlist can be added later if abuse shows up.

**Considered options:** Spotify-only identity (chosen). Separate app account, then connect Spotify.
