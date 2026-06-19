import test from 'node:test';
import assert from 'node:assert/strict';
import { FacebookPublisherService, InMemoryPublisherStore, buildAppSecretProof, classifyPublishRetry } from '../src/index.ts';

test('builds appsecret proof deterministically', () => {
  assert.equal(buildAppSecretProof('token','secret').length, 64);
});

test('publishes and records transitions', async () => {
  const store = new InMemoryPublisherStore();
  const service = new FacebookPublisherService(store, (async () => ({ ok: true, json: async () => ({ id: 'vid123', post_id: 'post123' }) })) as typeof fetch, { graphVersion: 'v22.0', appSecret: 'secret' });
  const target = service.createTarget({ tenantId: '00000000-0000-0000-0000-000000000001', provider: 'facebook', pageId: '123', displayName: 'Page', encryptedAccessTokenRef: 'kms://ref' });
  const job = service.createJob({ tenantId: target.tenantId, workflowId: '00000000-0000-0000-0000-000000000002', assetId: '00000000-0000-0000-0000-000000000003', targetId: target.id, caption: 'hello', correlationId: '00000000-0000-0000-0000-000000000004' });
  const done = await service.publish(job.id, 'https://example/video.mp4', 'token', '00000000-0000-0000-0000-000000000004');
  assert.equal(done.state, 'published');
  assert.equal(store.events.length, 3);
});

test('classifies retries', () => {
  assert.equal(classifyPublishRetry(500), 'retryable');
  assert.equal(classifyPublishRetry(400), 'fatal');
});
