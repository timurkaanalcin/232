# Readable (beautified) bundles — brokerz.customer.org.tr

Prettier-formatted copies of the deployed, minified production bundles, for easier reading/diffing.

| File | Source (original, minified) |
|------|------------------------------|
| `index.js`  | `../assets/index-C8lXDMCk.js` |
| `index.css` | `../assets/index-C7azBKOZ.css` |

Notes:
- Only whitespace/formatting was changed (`prettier --parser babel` / `--parser css`). Behavior is identical.
- This is a compiled Vite build, so identifiers stay minified (e.g. `t`, `s`, `a`) — beautifying cannot restore original variable/function names or comments.
- For the real, editable source of this app, see the repo at `_zip_review/brokerz/`.
