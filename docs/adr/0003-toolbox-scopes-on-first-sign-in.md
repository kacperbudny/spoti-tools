# Ask for toolbox scopes on first Sign-in

The first Sign-in asks Spotify for identity (`user-read-private`, `user-read-email`), library read (`user-library-read`), and playlist write (`playlist-modify-public`, `playlist-modify-private`). That matches the planned tools (collection, artist playlist). `user-read-email` is there because Better Auth (ADR 0004) needs an email to create the User record; our identity is still the Spotify account. Asking only for identity now would force every User to consent again when the first tool ships. Playback and follow scopes stay out.

**Considered options:** Toolbox scopes on first Sign-in (chosen). Identity-only, then re-consent per tool.
