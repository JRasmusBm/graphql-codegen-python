import {
  FieldDefinitionNode,
  GraphQLSchema,
  Kind,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
} from "graphql";

const indent = " ".repeat(4);

const pythonBuiltinTypes = {
  'String': 'str'
}

const nodeHandlers = {
  [Kind.NON_NULL_TYPE]: (node: NonNullTypeNode) => {
    return toPython(node.type)
  },
  [Kind.NAMED_TYPE]: (node: NamedTypeNode) => {
    return pythonBuiltinTypes[node.name.value] || node.name.value;
  },
  [Kind.FIELD_DEFINITION]: (node: FieldDefinitionNode) => {
    return `${node.name.value}: ${toPython(node.type) || 'None'}`;
  },
  [Kind.OBJECT_TYPE_DEFINITION]: (node: ObjectTypeDefinitionNode) => {
    const fields = node.fields?.map(toPython).filter(Boolean);

    return `class ${node.name.value}:
${indent}${fields.length ? fields.join("\n") : "pass"}`;
  },
};

const toPython = (node): string | null => {
  if (node.astNode) {
    node = node.astNode;
  }

  const handler = nodeHandlers[node.kind];

  if (handler) {
    return handler(node);
  }

  return null;
};

export function fromSchema(schema: GraphQLSchema): string {
  const typeMap = schema.getTypeMap();

  return Object.values(typeMap).map(toPython).filter(Boolean).join("\n\n");
}
