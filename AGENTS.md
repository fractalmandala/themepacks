# AGENTS

This is a package that catalogs the canonical themes curated for use with Fractalstyler across component libraries and sites.

1. `src/lib/canonical` records the source of truth for each theme. `canonical/index.ts` is the single source of truth. 
- if this is not up to date, it should be updated before any other action.
- all sets should be named `themes*` - themePlates, themesArtista, themesBase16, themesColourways, and so on.
- the `.ts` version of each group is its canonical. If `.ts`, `.json`, and `.md` are not aligned, they should be aligned first and `.ts` should be made up to date.

## Layout Styling

1. Never use `<main>` tag, it has already been applied in root layout.
2. Any page outer wrapper must use component PageShell.
