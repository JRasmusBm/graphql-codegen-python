import * as ast from "./ast";

const indent = " ".repeat(4);

const handlers = {
  ["type"]: (node: ast.ASTKindToInternalNode["type"]) => {
    return `class ${node.name}:
${indent}pass`;
  },
};

export function fromAST({ nodes }: ast.AST): string {
  return nodes
    .map((n) => {
      const handler = handlers[n.kind];

      if (handler) {
        return handler(n);
      }
    })
    .filter(Boolean)
    .join("\n");
}
