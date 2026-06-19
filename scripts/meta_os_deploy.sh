#!/bin/bash
echo "Deploying Zeaz Meta OS..."

# Build and start API
cd apps/zeaz-api
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ../..

# Build and start Next.js UI
cd apps/zeaz-web
npm install
npm run build
nohup npm start &
cd ../..

# Start self healing processes
cd runtime
source ../apps/zeaz-api/venv/bin/activate
nohup python self_healing_runtime.py &
nohup python queue_supervisor.py &
cd ..

echo "Deployment complete! Meta OS running on port 3000."
