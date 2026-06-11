#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgres://zveo:zveo_dev_password@localhost:5432/zveo}"

pnpm db:migrate
pnpm db:seed
node -e 'const pg=require("pg"); const c=new pg.Client({connectionString:process.env.DATABASE_URL}); (async()=>{await c.connect(); const r=await c.query("select count(*)::int as c from tenants"); console.log(`tenants=${r.rows[0].c}`); await c.end();})();'
