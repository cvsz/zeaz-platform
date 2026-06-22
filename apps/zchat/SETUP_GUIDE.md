# Setup Guide

This project runs as a Vite app with a React entry point in `src/main.jsx`.

## Prerequisites

- Node.js 18 or newer
- npm 8 or newer

## Install

```bash
npm install
```

## Configure

```bash
cp .env.example .env.local
```

Enable only the providers you want to use. The app will fall back to Smart Offline when no live provider succeeds.

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Provider Notes

- Google Gemini and Groq are the fastest low-friction options.
- Ollama is local-only and does not require a hosted API key.
- Smart Offline remains enabled by default so the UI always has a fallback response path.
