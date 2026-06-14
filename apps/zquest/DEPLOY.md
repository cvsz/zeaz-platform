# Deployment Checklist

## Pre-submit

- Open `index.html`
- Play through World 1
- Confirm controls work
- Confirm no console errors
- Confirm no secrets/API keys exist
- Confirm file is public-static only

## GitHub Pages

```bash
git init
git add index.html README.md DEPLOY.md
git commit -m "release: codex quest master omega final"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Then enable Pages from the repository settings.

## Vercel

```bash
npm i -g vercel
vercel --prod
```

No build command required.

## Netlify

Drag the folder into Netlify deploy UI or connect GitHub repo.

## itch.io

Zip `index.html`, upload as HTML game, enable "This file will be played in browser".
