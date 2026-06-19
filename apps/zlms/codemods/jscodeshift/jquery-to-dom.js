/**
 * jscodeshift transform for first-pass jQuery removal.
 * Converts safe selectors and common text/class/event APIs to native DOM calls.
 */
export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.CallExpression, {
    callee: { type: 'Identifier', name: '$' }
  }).forEach((path) => {
    const [selector] = path.node.arguments;
    if (!selector || selector.type !== 'Literal' || typeof selector.value !== 'string') {
      return;
    }

    path.replace(
      j.callExpression(
        j.memberExpression(j.identifier('document'), j.identifier('querySelector')),
        [selector]
      )
    );
  });

  root.find(j.CallExpression, {
    callee: { type: 'MemberExpression', property: { type: 'Identifier', name: 'text' } }
  }).forEach((path) => {
    const [value] = path.node.arguments;
    if (!value) {
      return;
    }

    path.replace(
      j.assignmentExpression('=', j.memberExpression(path.node.callee.object, j.identifier('textContent')), value)
    );
  });

  root.find(j.CallExpression, {
    callee: { type: 'MemberExpression', property: { type: 'Identifier', name: 'addClass' } }
  }).forEach((path) => {
    const [className] = path.node.arguments;
    if (!className) {
      return;
    }

    path.replace(
      j.callExpression(
        j.memberExpression(
          j.memberExpression(path.node.callee.object, j.identifier('classList')),
          j.identifier('add')
        ),
        [className]
      )
    );
  });

  root.find(j.CallExpression, {
    callee: { type: 'MemberExpression', property: { type: 'Identifier', name: 'on' } }
  }).forEach((path) => {
    const [eventName, handler] = path.node.arguments;
    if (!eventName || !handler) {
      return;
    }

    path.replace(
      j.callExpression(
        j.memberExpression(path.node.callee.object, j.identifier('addEventListener')),
        [eventName, handler]
      )
    );
  });

  return root.toSource({ quote: 'single' });
}
