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
The signed-in hub for a User, at `/app`. It shows who they are (Spotify display name), Sign-out, and the Tools they can open. A Visitor who opens a Dashboard or Tool URL is sent to the Landing.
_Avoid_: Panel, logged-in home. Do not call this surface "the App"; `/app` is only the path.

**Tool**:
A named capability a User opens from the Dashboard. Each Tool has its own path under `/app`.
_Avoid_: Feature, widget, app

**Library**:
The albums a User has saved as albums on Spotify. It is not Liked Songs, playlists, or followed artists. Spotify's own "Your Library" screen is a larger mix; that is not this word.
_Avoid_: Collection, catalog, Your Library

**Album**:
A saved release in the Library. Every Library item is an Album. Its type is album, single, or compilation.
_Avoid_: Record, release (as the name of this object)

**Album type**:
How an Album is filed: album, single, or compilation. album means a full-length release. There is no EP type; Spotify files those as album or single. In the Random album UI, the single toggle is labeled Single/EP to match Spotify.
_Avoid_: EP, LP (as separate toggle labels; Single/EP is the UI label for single)

**Random album**:
The Tool at `/app/random-album`. The User Starts it; it does not run by opening the page.
_Avoid_: Random album selector, picker, collection picker

**Start**:
The User's act of running Random album. It loads the Library and produces a Pick from the Album types selected at that moment. If there is no Pick, Start stays the action. Opening the Tool is not Start.
_Avoid_: Run, load, fetch, go

**Pick**:
The Album Random album is showing. Changing Album types does not change the Pick; only Re-shuffle does.
_Avoid_: Result, selection, roll

**Re-shuffle**:
Asking Random album for another Pick from the Library already loaded since Start, using the Album types selected now. There is no Re-shuffle when there is no Pick.
_Avoid_: Reload, refresh, randomize again

**Session**:
The period a User stays signed in on one browser, until Sign-out or Spotify refuses to refresh. Closing the tab does not end it. Other browsers keep their own Session.
_Avoid_: Cookie, JWT, token

**Sign-in**:
The act of completing Spotify OAuth. It turns a Visitor into a User and is the only way into the Dashboard. Cancel or deny leaves them a Visitor on the Landing, with a short error.
_Avoid_: Login with email, register, sign up

**Sign-out**:
Ending this browser's Session only. Other Sessions stay signed in. It does not revoke Spotify's grant. This browser's person is a Visitor again until the next Sign-in.
_Avoid_: Disconnect, unlink, revoke
