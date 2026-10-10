# fractaldesign Themepacks

Simply a collection of themes and color palettes from all over, standardized into a singular typed interface system.

pnpm is the package manager.

```
src/lib/
├── color-utils.ts               # Zero-dependency color math: OKLCH, OKLab, sRGB, Hex, WCAG contrast
├── types.ts                     # Canonical TypeScript interfaces (FractalTheme, FractalColor, etc.)
├── generator/                   # Folder containing ways to convert themes to type and generate canonicals
│   ├── generator.ts             # Single source of truth trio compiler (.json, .ts, .md)
│   ├── convert.ts               # Master runner script (executable via `pnpm themes:convert`)
│   ├── artisan-colors.ts        # Raw data for artisan swatches
│   ├── themes.ts                # Raw data with custom themes broken into foreground, background groups
│   ├── colourways.ts            # Raw data for vibrant spectrum colourways
│   ├── indes.json               # Raw data for Indic regional UI themes
│   ├── converters/
│   │   ├── base16.ts            # Parser for base16/*.yaml (16 functional registers)
│   │   ├── tailwind.ts          # Parser for allsets.sass (WebAwesome/Tailwind 05-95 lightness ramps)
│   │   ├── uno.ts               # Parser for colors.md (Open Color 0-9 chromatic scales)
│   │   ├── fracta.ts            # Parser for palettes.json (paired editor syntax & chrome themes)
│   │   ├── vecta.ts             # Parser for themes.ts (full UI token shells & aura metadata)
│   │   ├── artisan.ts           # Parser for artisan-colors.ts (curated pigments + WCAG contrast)
│   │   ├── colourways.ts        # Parser for colourways.ts (vibrant spectrum swatches)
│   │   └── indes.ts             # Parser for indes.json (paired light/dark Indic UI tokens)
└── canonical/                   # Generated Trios & Master Index
    ├── index.ts & index.json    # Master registry & helpers (getAllThemes, getThemeById)
    ├── themesBase16.[json|ts|md]
    ├── themesTailwind.[json|ts|md]
    ├── themesUno.[json|ts|md]
    ├── themesFracta.[json|ts|md]
    ├── themesVecta.[json|ts|md]
    ├── themesArtista.[json|ts|md]
    ├── themesColourways.[json|ts|md]
    └── themesIndes.[json|ts|md]
```
