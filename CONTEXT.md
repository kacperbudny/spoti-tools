# SpotiTools

A toolbox that acts as a signed-in Spotify user. Visitors see a public Landing. Users work in a Dashboard. There is no separate app account.

## Language

**Visitor**:
A person looking at the site who has not completed Sign-in.
_Avoid_: Guest, anonymous user

**User**:
A person identified by their Spotify account. Completing Spotify OAuth is how they become a User. The same Spotify account is the same User on every device.
_Avoid_: Account, member, customer, app user

**Landing**:
The public page for Visitors, at `/`. It is not the signed-in product. A signed-in User who opens it is sent to the Dashboard.
_Avoid_: Marketing page, home

**Dashboard**:
The signed-in home for a User, at `/app`. It shows who they are (Spotify display name) and Sign-out. Later tools live here. A Visitor who opens a Dashboard URL is sent to the Landing.
_Avoid_: Panel, logged-in home. Do not call this surface "the App"; `/app` is only the path.

**Session**:
The period a User stays signed in on one browser, until Sign-out or Spotify refuses to refresh. Closing the tab does not end it. Other browsers keep their own Session.
_Avoid_: Cookie, JWT, token

**Sign-in**:
The act of completing Spotify OAuth. It turns a Visitor into a User and is the only way into the Dashboard. Cancel or deny leaves them a Visitor on the Landing, with a short error.
_Avoid_: Login with email, register, sign up

**Sign-out**:
Ending this browser's Session only. Other Sessions stay signed in. It does not revoke Spotify's grant. This browser's person is a Visitor again until the next Sign-in.
_Avoid_: Disconnect, unlink, revoke
