#!/usr/bin/env node
import process from "node:process";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const namespace = process.env.QUEUE_NAMESPACE ?? "zveo";
const queueName = process.env.RENDER_QUEUE ?? "zveo.render";
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
const queue = new Queue(queueName, { connection, prefix: namespace });
const counts = await queue.getJobCounts("waiting", "active", "delayed", "completed", "failed", "paused");
const waiting = counts.waiting ?? 0;
const delayed = counts.delayed ?? 0;
const failed = counts.failed ?? 0;
const active = counts.active ?? 0;
console.log(JSON.stringify({ queue: queueName, namespace, status: failed > 0 ? "degraded" : "ok", waiting, delayed, active, failed, checkedAt: new Date().toISOString() }));
await queue.close();
await connection.quit();
