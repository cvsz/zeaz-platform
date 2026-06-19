#!/bin/bash
cd /home/zeazdev/zeaz-platform/apps/zcino-modern/frontend
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
PORT=3000 HOSTNAME=0.0.0.0 npm start
