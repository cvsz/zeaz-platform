export function getConfig(env = process.env) {
  return {
    port: Number(env.PORT || 4113),
    nodeEnv: env.NODE_ENV || 'development',
    databaseUrl: env.DATABASE_URL || '',
    lineChannelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN || '',
    lineChannelSecret: env.LINE_CHANNEL_SECRET || '',
    lineWebhookSecret: env.LINE_WEBHOOK_SECRET || '',
  };
}
