# smali

A small shared map for sheep gathering: optional location sharing, coloured markers, notes and freehand drawings.

**Frontend:** https://grigorysolomatov.github.io/smali/

This repository hosts the public browser assets. Private group data is held by a separate, invitation-protected backend; no invitations, sessions or participant data are published here. The `gh-pages` branch is the deployed frontend.

The frontend does not make the backend permanent: the current backend uses temporary HTTPS hosting without an uptime guarantee. Offline support covers the app shell and queued edits, not downloaded basemaps. Location sharing starts only after an explicit user action.

Leaflet 1.9.4 is vendored under its included BSD-2-Clause licence. Map data © OpenStreetMap contributors.
