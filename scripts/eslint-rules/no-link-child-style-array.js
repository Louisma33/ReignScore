const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow array styles in Link asChild children to prevent Web crashes',
        },
        fixable: 'code',
        schema: [],
    },
    create(context) {
        return {
            JSXElement(node) {
                const openingElement = node.openingElement;
                // Check if it is a <Link>
                if (openingElement.name.name !== 'Link') return;

                // Check for asChild prop
                const hasAsChild = openingElement.attributes.some(
                    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'asChild'
                );
                if (!hasAsChild) return;

                // Check children
                const children = node.children.filter(child => child.type === 'JSXElement');
                if (children.length !== 1) return; // asChild expects single child usually

                const child = children[0];
                const styleAttr = child.openingElement.attributes.find(
                    (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'style'
                );

                if (!styleAttr) return;

                // Check if style value is an array expression: style={[ ... ]}
                if (
                    styleAttr.value.type === 'JSXExpressionContainer' &&
                    styleAttr.value.expression.type === 'ArrayExpression'
                ) {
                    context.report({
                        node: styleAttr,
                        message: 'Avoid passing style arrays to children of Link asChild. This crashes on Web. Use StyleSheet.flatten() or SafeLink.',
                        fix(fixer) {
                            const sourceCode = context.sourceCode;
                            const expression = styleAttr.value.expression;
                            const text = sourceCode.getText(expression);
                            // Simple fix: StyleSheet.flatten( ... )
                            // We assume StyleSheet is available or user will fix import.
                            return fixer.replaceText(expression, `StyleSheet.flatten(${text})`);
                        }
                    });
                }
            },
        };
    },
};

module.exports = rule;
