import * as ast from "./ast";

const indent = " ".repeat(4);

const typeHandler = ({ optional, ...fieldType }: ast.InternalType) => {
  if (optional) {
    return `Optional[${typeHandler(fieldType)}]`;
  }

  return fieldType.name;
};

const fieldHandler = (field: ast.InternalField) => {
  return `${field[0]}: ${typeHandler(field[1])}`;
};

const nodeHandlers = {
  type: (node: ast.ASTKindToInternalNode["type"]) => {
    return `class ${node.name}:
${indent}${
      node.fields?.length
        ? node.fields.map(fieldHandler).join(`\n${indent}`)
        : "pass"
    }`;
  },
};

export function fromAST({ nodes }: ast.AST): string {
  return nodes
    .map((node) => {
      const handler = nodeHandlers[node.kind];

      if (handler) {
        return handler(node);
      }
    })
    .filter(Boolean)
    .join("\n");
}
