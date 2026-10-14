# Folder map — Kediri Cinematic History

```text
.
├── src/
│   ├── main.js           # App bootstrap
│   ├── style.css         # Global styles
│   ├── core/             # State, audio, utilities
│   ├── components/       # Museum modules (map, quiz, vault, …)
│   └── data/             # Landmarks, i18n, quiz content
├── public/               # (optional) static files served as-is
├── tests/                # Placeholder for future smoke tests
├── docs/                 # Documentation
├── .github/workflows/    # Deploy automation
├── index.html            # Vite entry HTML shell
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Naming

- **Folders:** kebab-case (`src/components`, `src/data`).
- **Modules:** kebab-case `.js` files.
- **Data:** descriptive kebab-case keys inside JSON-like modules.
