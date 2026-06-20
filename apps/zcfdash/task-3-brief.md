# Task 3: Refresh Frontend and Implement Polling for ZCFDash Health Cockpit

## Task Description
Implement JavaScript `fetch` polling in `apps/zcfdash/html/index.html` to backend endpoints: `/api/connectivity`, `/api/cloudflare/tunnels`, `/api/cloudflare/waf`. Update the dashboard to dynamically update status badges based on API responses. Use the existing UI structure and modern ZeaZ Platform design tokens.

## Context
The ZCFDash frontend currently uses mock data. This task connects it to the real backend API. The backend expects requests to `/api/connectivity`, `/api/cloudflare/tunnels`, and `/api/cloudflare/waf`.

## Requirements
1. Implement JS `fetch` polling logic (every 30 seconds).
2. Update dashboard status badges dynamically based on API responses.
3. Maintain the existing UI structure and aesthetic (glassmorphism).
4. Ensure robust error handling (mark status as 'unknown' or 'offline' if API fails).
5. Add console logs for polling activity.
