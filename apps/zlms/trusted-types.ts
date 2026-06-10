import { getTrustedTypesPolicy, sanitizeTrustedHtml, toTrustedHTML } from './frontend/runtime/trusted-html';

export type TrustedTypesBootstrapResult = Readonly<{
  policyName: 'zlms#trusted-html';
  enforced: boolean;
}>;

export function bootstrapTrustedTypes(): TrustedTypesBootstrapResult {
  const policy = getTrustedTypesPolicy();
  return {
    policyName: 'zlms#trusted-html',
    enforced: Boolean(policy)
  };
}

export { sanitizeTrustedHtml, toTrustedHTML };
