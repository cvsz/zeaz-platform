import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const PARSER_OPTIONS = {
  sourceType: 'unambiguous',
  plugins: ['jsx', 'typescript', 'classProperties', 'optionalChaining']
};

function isStringTimer(callee) {
  return t.isIdentifier(callee, { name: 'setTimeout' }) || t.isIdentifier(callee, { name: 'setInterval' });
}

export function transformUnsafeDomSinks(source, options = {}) {
  const ast = parse(source, PARSER_OPTIONS);
  let changed = false;

  traverse.default(ast, {
    AssignmentExpression(path) {
      const { node } = path;
      if (t.isMemberExpression(node.left) && t.isIdentifier(node.left.property, { name: 'innerHTML' })) {
        node.left.property = t.identifier('textContent');
        changed = true;
      }
    },
    CallExpression(path) {
      const { node } = path;
      if (t.isIdentifier(node.callee, { name: 'eval' })) {
        path.replaceWith(t.callExpression(t.identifier('JSON.parse'), node.arguments));
        changed = true;
        return;
      }

      if (t.isNewExpression(node.callee, { name: 'Function' })) {
        path.replaceWith(t.callExpression(t.identifier('createBlockedDynamicFunction'), []));
        changed = true;
        return;
      }

      if (isStringTimer(node.callee) && t.isStringLiteral(node.arguments[0])) {
        node.arguments[0] = t.arrowFunctionExpression([], t.blockStatement([]));
        changed = true;
        return;
      }

      if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property, { name: 'html' })) {
        node.callee.property = t.identifier('text');
        changed = true;
      }
    },
    JSXAttribute(path) {
      const name = path.node.name;
      if (t.isJSXIdentifier(name, { name: 'dangerouslySetInnerHTML' })) {
        path.remove();
        changed = true;
      }
    }
  });

  return changed ? generate.default(ast, options.generator ?? { retainLines: true }).code : source;
}

export default function unsafeDomSinksBabelPlugin() {
  return {
    name: 'zlms-remove-unsafe-dom-sinks',
    visitor: {}
  };
}
