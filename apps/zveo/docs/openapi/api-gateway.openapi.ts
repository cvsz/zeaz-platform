export const openApiDocument = {
  openapi: "3.1.0",
  info: { title: "zVEO API Gateway", version: "1.0.0", description: "Queue-first media orchestration API for Veo, Google Flow, and Nano Banana workflows." },
  servers: [{ url: "http://localhost:8080" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } },
    schemas: {
      ErrorResponse: { type: "object", required: ["error", "correlationId"], properties: { error: { type: "string" }, correlationId: { type: "string", format: "uuid" } } },
      WorkflowSubmission: { type: "object", required: ["idempotencyKey", "tenantId", "projectId", "createdBy", "renderProvider", "sceneGraph"], properties: { idempotencyKey: { type: "string", minLength: 8 }, tenantId: { type: "string", format: "uuid" }, projectId: { type: "string", format: "uuid" }, createdBy: { type: "string", format: "uuid" }, priority: { type: "integer", minimum: 0, maximum: 100 }, renderProvider: { enum: ["veo", "google_flow", "nano_banana"] }, sceneGraph: { type: "object" } } },
      WorkflowAccepted: { type: "object", required: ["workflowId", "state", "queuedScenes", "correlationId"], properties: { workflowId: { type: "string", format: "uuid" }, state: { type: "string" }, queuedScenes: { type: "integer" }, correlationId: { type: "string", format: "uuid" } } },
      Metrics: { type: "string" }
    }
  },
  paths: {
    "/healthz": { get: { security: [], responses: { "200": { description: "service health" } } } },
    "/readyz": { get: { security: [], responses: { "200": { description: "dependency readiness" } } } },
    "/metrics": { get: { security: [], responses: { "200": { description: "Prometheus metrics", content: { "text/plain": { schema: { $ref: "#/components/schemas/Metrics" } } } } } } },
    "/openapi.json": { get: { security: [], responses: { "200": { description: "OpenAPI document" } } } },
    "/v1/workflows": { post: { summary: "Submit a render workflow", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/WorkflowSubmission" } } } }, responses: { "202": { description: "Workflow accepted", content: { "application/json": { schema: { $ref: "#/components/schemas/WorkflowAccepted" } } } }, "400": { description: "Validation error" }, "401": { description: "Authentication error" }, "403": { description: "Authorization error" } } } }
  }
} as const;
