module.exports = {
  apps: [
  {
    "name": "openwork",
    "script": "pnpm",
    "args": "run dev",
    "cwd": "apps/openwork",
    "env": {
      "PORT": "3000"
    }
  },
  {
    "name": "web",
    "script": "pnpm",
    "args": "run dev",
    "cwd": "apps/web",
    "env": {
      "PORT": "3001"
    }
  }
]
};
