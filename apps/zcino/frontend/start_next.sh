#!/bin/bash
cd /home/zeazdev/zeaz-platform/apps/zcino/frontend
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
PORT=3020 HOSTNAME=0.0.0.0 CATALOG_API_URL=http://localhost:8086 npm run dev
