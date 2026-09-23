# Landing for Visitors, Dashboard for Users

The site has two surfaces. A Visitor sees the Landing. After Sign-in they land on the Dashboard, even before any tool exists. A User who opens the Landing is sent to the Dashboard. A Visitor who opens a Dashboard URL is sent to the Landing — we do not start OAuth from a raw URL. This split is the product shape: public entry vs the toolbox. Changing it later means redoing routes, chrome, and every “where does this button go” decision.

The Dashboard lives at `/app`. The word for the surface is still Dashboard, not "the App". The first Sign-in ticket built both shells with plain UI (Sign-in + error on the Landing; display name + Sign-out on the Dashboard). Auth behavior was the point; look was deferred. The authenticated look is now ADR 0006; the Landing as a public page remains its own ticket.

**Considered options:** Whole site is the door until tools exist. Public Landing plus a signed-in Dashboard (chosen).
