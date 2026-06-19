# Self-hosted fonts

PRIZM 4.0 self-hosts all fonts for air-gap compatibility. No external CDN references anywhere in the codebase.

## Required font files

Drop the following files into the directories below. All files must be `.woff2` for size efficiency.

### Inter (primary sans)

Download from [rsms.me/inter](https://rsms.me/inter/) or [Google Fonts](https://fonts.google.com/specimen/Inter).

```
public/fonts/Inter/
├── Inter-VariableFont_opsz,wght.woff2
└── Inter-Italic-VariableFont_opsz,wght.woff2
```

### JetBrains Mono (code/mono)

Download from [JetBrains](https://www.jetbrains.com/lp/mono/) or [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono).

```
public/fonts/JetBrainsMono/
└── JetBrainsMono-VariableFont_wght.woff2
```

## License

Both fonts are licensed under the SIL Open Font License (OFL). Their license files must be retained alongside the font files when redistributing.

## Why self-hosted

- **Air-gap compatibility** — secured environments cannot reach Google Fonts CDN
- **Performance** — eliminates a network round-trip on first paint
- **Privacy** — no third-party tracking via font requests
- **Reproducibility** — fonts are versioned with the rest of the system

## The air-gap audit

`pnpm audit:airgap` will fail CI if any code references `fonts.googleapis.com`, `fonts.gstatic.com`, or other font CDNs.
