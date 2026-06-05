// security/trusted-types-policy.js

if (window.trustedTypes && trustedTypes.createPolicy) {
  trustedTypes.createPolicy('zlms-secure-policy', {
    createHTML(input) {
      return input;
    },
    createScriptURL(input) {
      return input;
    },
    createScript(input) {
      return input;
    }
  });
}
