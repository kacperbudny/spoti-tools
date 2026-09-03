# Dashboard is a hub; each Tool has its own path

The Dashboard at `/app` is the signed-in hub, not the first Tool. Each Tool lives at its own path under `/app`. Putting the first Tool on `/app` would force a move when the next Tool ships; a same-page add-on would mix hub chrome with Tool UI. A hub with one link is thin, but the URLs stay still.

**Considered options:** `/app` is the first Tool. `/app` is a hub; Tools have their own paths (chosen). Identity + first Tool share `/app` with no extra route.
