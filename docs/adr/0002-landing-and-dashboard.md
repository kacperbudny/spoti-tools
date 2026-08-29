# Landing for Visitors, Dashboard for Users

The site has two surfaces. A Visitor sees the Landing. After Sign-in they land on the Dashboard, even before any tool exists. A User who opens the Landing is sent to the Dashboard. A Visitor who opens a Dashboard URL is sent to the Landing — we do not start OAuth from a raw URL. This split is the product shape: public entry vs the toolbox. Changing it later means redoing routes, chrome, and every “where does this button go” decision.

The Dashboard lives at `/app`. The word for the surface is still Dashboard, not "the App". The first Sign-in ticket builds both shells, but the UI stays plain (Sign-in + error on the Landing; display name + Sign-out on the Dashboard). Auth behavior is the point; look comes later (KAC-13 for the Landing).

**Considered options:** Whole site is the door until tools exist. Public Landing plus a signed-in Dashboard (chosen).
