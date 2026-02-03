# OpenClaw Academy (learn/)

Gamified course UI for teaching OpenClaw architecture, tools, and ops.

## Quickstart

```bash
pnpm install
pnpm dev
```

## Tests

```bash
pnpm test
pnpm lint
```

## Verify

```bash
pnpm learn:verify
```

If this is your first time running Playwright, install browsers:

```bash
npx playwright install
```

## Notes

- Progress is stored in `localStorage` under `openclaw.learn.progress`. Clear it to reset.
- Repo snippets are pulled from the parent workspace; keep the `learn/` folder inside the OpenClaw repo.
