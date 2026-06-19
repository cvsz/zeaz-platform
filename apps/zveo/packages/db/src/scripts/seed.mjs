import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL ?? "postgres://zveo:zveo_dev_password@localhost:5432/zveo";

const client = new Client({ connectionString });

const tenantId = "11111111-1111-1111-1111-111111111111";
const projectId = "22222222-2222-2222-2222-222222222222";
const workflowId = "33333333-3333-3333-3333-333333333333";

await client.connect();
try {
  await client.query("BEGIN");
  await client.query(
    `INSERT INTO tenants (id, name, slug) VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO NOTHING`,
    [tenantId, "Demo Tenant", "demo-tenant"],
  );
  await client.query(
    `INSERT INTO projects (id, tenant_id, name) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [projectId, tenantId, "Demo Project"],
  );
  await client.query(
    `INSERT INTO workflows (id, tenant_id, project_id, name, scene_graph, status)
     VALUES ($1, $2, $3, $4, $5::jsonb, 'queued')
     ON CONFLICT DO NOTHING`,
    [workflowId, tenantId, projectId, "Sample Workflow", JSON.stringify({ nodes: [{ id: "scene-1", prompt: "Wide shot in cinematic style" }], edges: [] })],
  );
  await client.query("COMMIT");
  console.log("seed complete");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
