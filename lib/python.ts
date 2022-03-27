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

type Imports = Record<string, Set<string>>;
function mergeImports(
  imports: Imports,
  newImports: Record<string, Set<string> | string[]>
): Imports {
  for (const module in newImports) {
    for (const item of newImports[module]) {
      if (!imports[module]) {
        imports[module] = new Set();
      }

      imports[module].add(item);
    }
  }

  return imports;
}

const nodeHandlers = {
  [ExtraKind.OPTIONAL_TYPE]: function handleOptionalTypeNode(node) {
    const [code, imports] = toPython(node.type);

    return [
      `Optional[${code}]`,
      mergeImports(imports, { typing: ["Optional"] }),
    ];
  },
  [Kind.NON_NULL_TYPE]: function handleNonNullTypeNode(node: NonNullTypeNode) {
    return toPython(node.type);
  },
  [Kind.LIST_TYPE]: function handleNonNullTypeNode(node: NonNullTypeNode) {
    const [code, imports] = toPython(node.type);

    return [`List[${code}]`, mergeImports(imports, { typing: ["List"] })];
  },
  [Kind.NAMED_TYPE]: function handleNamedTypeNode(node: NamedTypeNode) {
    return [pythonBuiltinTypes[node.name.value] || node.name.value, {}];
  },
  [Kind.FIELD_DEFINITION]: function handleFieldDefinitionNode(
    node: FieldDefinitionNode
  ) {
    const [code, imports] = toPython(node.type);

    return [`${node.name.value}: ${code || "None"}`, imports];
  },
  [Kind.OBJECT_TYPE_DEFINITION]: function handleObjectTypeDefinitionNode(
    node: ObjectTypeDefinitionNode
  ) {
    const [fields, imports] = listToPython(node.fields);

    return [
      `class ${node.name.value}:
${indent}${fields.length ? fields.join("\n") : "pass"}`,
      imports,
    ];
  },
};

function patchNode(node) {
  if (node.astNode) {
    node = node.astNode;
  }

  if ([Kind.FIELD_DEFINITION, Kind.LIST_TYPE].includes(node.kind)) {
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

function listToPython(nodeList): [string[], Imports] {
  const items = [];
  let imports = {};

  for (const node of nodeList || []) {
    const [code, currentImports] = toPython(node);

    if (!code) {
      continue;
    }

    imports = mergeImports(imports, currentImports);
    items.push(code);
  }

  return [items, imports];
}

const toPython = (node): [string | null, Imports] => {
  node = patchNode(node);

  if (!node.kind) {
    return [null, {}];
  }

  const handler = nodeHandlers[node.kind];

  if (!handler) {
    console.warn(`Could not find handler for ${node.kind}`);

    return [null, {}];
  }

  return handler(node);
};

export function fromSchema(schema: GraphQLSchema): string {
  const typeMap = schema.getTypeMap();
  const [items, imports] = listToPython(Object.values(typeMap));

  const importStatements = Object.entries(imports).map(
    ([module, items]) =>
      `from ${module} import ${Array.from(items).sort().join(", ")}`
  ).join("\n");

  return [importStatements, ...items].filter(Boolean).join("\n\n");
}
