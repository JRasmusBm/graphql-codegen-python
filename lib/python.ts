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
  String: "str",
};

enum ExtraKind {
  OPTIONAL_TYPE = "ExtraNodeOptionalType",
}

const nodeHandlers = {
  [ExtraKind.OPTIONAL_TYPE]: (node) => {
    return `Optional[${toPython(node.type)}]`;
  },
  [Kind.NON_NULL_TYPE]: (node: NonNullTypeNode) => {
    return toPython(node.type);
  },
  [Kind.NAMED_TYPE]: (node: NamedTypeNode) => {
    return pythonBuiltinTypes[node.name.value] || node.name.value;
  },
  [Kind.FIELD_DEFINITION]: (node: FieldDefinitionNode) => {
    return `${node.name.value}: ${toPython(node.type) || "None"}`;
  },
  [Kind.OBJECT_TYPE_DEFINITION]: (node: ObjectTypeDefinitionNode) => {
    const fields = node.fields?.map(toPython).filter(Boolean);

    return `class ${node.name.value}:
${indent}${fields.length ? fields.join("\n") : "pass"}`;
  },
};

function patchNode(node) {
  if (node.astNode) {
    node = node.astNode;
  }

  if ([Kind.FIELD_DEFINITION].includes(node.kind)) {
    if (node.type.kind !== Kind.NON_NULL_TYPE) {
      return {
        ...node,
        type: {
          kind: ExtraKind.OPTIONAL_TYPE,
          type: node.type,
        },
      };
    }
  }

  return node;
}

const toPython = (node): string | null => {
  node = patchNode(node);

  if (!node.kind) {
    return null;
  }

  const handler = nodeHandlers[node.kind];

  if (!handler) {
    console.warn(`Could not find handler for ${node.kind}`);

    return null;
  }

  return handler(node);
};

export function fromSchema(schema: GraphQLSchema): string {
  const typeMap = schema.getTypeMap();

  return Object.values(typeMap).map(toPython).filter(Boolean).join("\n\n");
}
