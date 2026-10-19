# CLAUDE.md

Internal drafts of linearb.io pages. See `README.md` for the page list, how to run them and the block catalogue.

## Reuse blocks

- Before building a section, check the block catalogue in `README.md`. If a block does the same job, reuse its markup and styles and change only the copy.
- Build a new block only when nothing in the catalogue fits. Say so, and add it to the catalogue in the same change.
- Lifting from `brand.html`: take the block's final rendered styles, since that file layers a terminal theme under the brand styles.
- If a block in the catalogue's "open decisions" list is involved, ask which version to use instead of picking one.

## Pages

- Each product page is a self-contained `products/<page-name>/index.html` with its own `variants.json`, loading `../../variants.js`. Keep paths relative.
- Run `python3 serve.py <port>` to preview; it also saves variants panel choices into the page files.
- Interactive demos must not shift the page: fixed heights, or the `reserve()` helper for panels whose content changes.
- Label sample data as sample data.

## Copy

- Distributed copy follows the LinearB copy rules (the `linearb-copy` skill when available).
- Sentence case, no em dashes, no eyebrow labels above headings.
- Use only cleared numbers and customers; flag anything uncertain instead of smoothing it over.
