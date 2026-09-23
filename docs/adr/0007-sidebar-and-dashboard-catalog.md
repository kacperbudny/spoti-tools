# Desktop has a destination sidebar and a Dashboard catalog

ADR 0005 still holds: `/app` is the Dashboard hub; each Tool has its own path. Chrome is extra.

On desktop, a left nav lists Dashboard, Tools, Sign-out, and a quiet Install. The Dashboard is still a catalog: large Tool cards with an icon, name, and a short explanation — even though the sidebar already lists those Tools. The sidebar is jump navigation; the catalog is how you learn what a Tool is.

On the phone there is no sidebar and no bottom tabs. The Dashboard is the picker: the same cards, stacked full-width. A Tool page has Back to Dashboard only; Sign-out lives on the Dashboard.

A desktop Home that omits the catalog would make the sidebar the only picker and skip the explanations. A phone drawer for one Tool is extra chrome.

**Considered options:** Desktop sidebar plus catalog; phone stacked cards (chosen). Desktop Home without a Tool list. Compact text list on the phone. Hamburger drawer on the phone.
