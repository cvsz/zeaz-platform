#!/bin/bash
echo "Deploying Zeaz Meta OS..."

# Build and start API
cd apps/api
pip install -r requirements.txt
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ../..

# Build and start Next.js UI
cd apps/web
npm install
npm run build
nohup npm start &
cd ../..

# Start self healing processes
cd runtime
nohup python self_healing_runtime.py &
nohup python queue_supervisor.py &
cd ..

echo "Deployment complete! Meta OS running on port 3000."
