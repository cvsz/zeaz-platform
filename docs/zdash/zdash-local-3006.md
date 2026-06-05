# zDash on `zzdash.zeaz.dev:3006`

Local service endpoint:

```text
http://127.0.0.1:3006
http://zzdash.zeaz.dev:3006
```

## Run locally

```bash
cd ~/zeaz-platform/apps/zdash
npm install
npm run dev
```

## Production-like preview

```bash
cd ~/zeaz-platform/apps/zdash
npm install
npm run build
npm run preview
```

## Optional hosts entry

```bash
printf '%s\n' '127.0.0.1 zzdash.zeaz.dev' | sudo tee -a /etc/hosts
```

## systemd service path

Use `WorkingDirectory=/home/zeazdev/zeaz-platform/apps/zdash` and `ExecStart=/usr/bin/npm run preview`.
