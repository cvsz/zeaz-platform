export const jwtMiddleware = async (request, env, next) => {
  // FIXME(issue-123): Implement actual JWT validation
  return await next();
};
