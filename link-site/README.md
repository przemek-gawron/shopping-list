# Plan link site

Plan links (`https://przemek-gawron.github.io/dishdeck/p#…`) open the app through iOS Universal Links and Android App Links. Both need files at the root of the domain, so this folder is published as the GitHub Pages user site: the repository `przemek-gawron/przemek-gawron.github.io`.

1. Copy this folder's contents (including `.well-known/` and `.nojekyll`, without which GitHub Pages skips `.well-known`) to that repository and enable Pages.
2. `apple-app-site-association`: replace `TEAM_ID` with the Apple Developer Team ID.
3. `assetlinks.json`: replace the fingerprints with the SHA-256 of the app signing key and the upload key (Play Console → Test and release → App integrity), plus the EAS key for internal builds if needed (`eas credentials`).
4. Check: `curl -i https://przemek-gawron.github.io/.well-known/apple-app-site-association` and `…/assetlinks.json` return 200 and JSON.
5. Ship a new native build (`associatedDomains` and `intentFilters` in `app.json` do not go out with an OTA update).

`dishdeck/p/index.html` is shown when the app is not installed: it links to the store and to `dishdeck://p#…` with the same data.
