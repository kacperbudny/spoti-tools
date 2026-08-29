# Better Auth for Sign-in

Sign-in is Spotify OAuth only, with a Session per browser and a User in Neon. We use Better Auth: it has a Spotify social provider, a Drizzle adapter, and first-class extra scopes. Auth.js would also work; we picked Better Auth to stay closer to Drizzle and to set toolbox scopes in config. We do not hand-roll OAuth.

Better Auth creates a User from the Spotify profile and expects an email. First Sign-in therefore also asks for `user-read-email` (see ADR 0003). Identity in *our* glossary is still the Spotify account, not the email.

**Considered options:** Better Auth (chosen). Auth.js. Hand-rolled OAuth.
