/**
 * jscodeshift transform that prepares JS/JSX modules for strict TypeScript.
 * It adds unknown annotations to untyped function params and converts CommonJS
 * default exports to ES module syntax where safe.
 */
export default function transformer(fileInfo, api) {
  const j = api.jscodeshift.withParser(fileInfo.path.endsWith('x') ? 'tsx' : 'ts');
  const root = j(fileInfo.source);

  root.find(j.FunctionDeclaration).forEach((path) => {
    for (const param of path.node.params) {
      if ((param.type === 'Identifier' || param.type === 'RestElement') && !param.typeAnnotation) {
        param.typeAnnotation = j.tsTypeAnnotation(j.tsUnknownKeyword());
      }
    }
  });

  root.find(j.ArrowFunctionExpression).forEach((path) => {
    for (const param of path.node.params) {
      if (param.type === 'Identifier' && !param.typeAnnotation) {
        param.typeAnnotation = j.tsTypeAnnotation(j.tsUnknownKeyword());
      }
    }
  });

  root.find(j.AssignmentExpression, {
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'module' },
      property: { type: 'Identifier', name: 'exports' }
    }
  }).forEach((path) => {
    const statement = path.parent.node;
    if (statement.type === 'ExpressionStatement') {
      j(path.parent).replaceWith(j.exportDefaultDeclaration(path.node.right));
    }
  });

  return root.toSource({ quote: 'single' });
}
