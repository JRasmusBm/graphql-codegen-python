import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from "graphql";

const indent = " ".repeat(4);

const pythonBuiltinTypes = {
  Int: "int",
  Float: "float",
  String: "str",
  Boolean: "bool",
  ID: "str",
};

enum ExtraKind {
  OPTIONAL_TYPE = "ExtraNodeOptionalType",
  OBJECT_TYPE_ARGUMENT_DEFINITION = "ExtraNodeObjectTypeArgumentDefinition",
  ARGUMENT_FIELD_DEFINITION = "ExtraNodeArgumentFieldDefinition",
  ARGUMENT_OBJECT_FIELD_DEFINITION = "ExtraNodeObjectArgumentFieldDefinition",
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

const noopHandler = (..._args: any) => [null, {}];

const nodeHandlers = {
  [ExtraKind.OPTIONAL_TYPE]: function handleOptionalTypeNode(
    node,
    config: ActualFromSchemaConfig
  ) {
    const [code, imports] = toPython(node.type, config);

    return [
      `Optional[${code}]`,
      mergeImports(imports, { typing: ["Optional"] }),
    ];
  },
  [ExtraKind.ARGUMENT_FIELD_DEFINITION]:
    function handleArgumentTypeDefinitionNode(
      node: InputValueDefinitionNode,
      config: ActualFromSchemaConfig
    ) {
      const [typeCode, imports] = toPython(node.type, {
        ...config,
        wrapWithType: true,
      });

      if (!typeCode) {
        [null, {}];
      }

      return [`"${node.name.value}": ${typeCode}`, imports];
    },
  [ExtraKind.ARGUMENT_OBJECT_FIELD_DEFINITION]:
    function handleObjectArgumentDefinitionNode(
      node: FieldDefinitionNode,
      config: ActualFromSchemaConfig
    ) {
      const [typeFields, imports] = listToPython(
        node.arguments.map((a) => ({
          ...a,
          kind: ExtraKind.ARGUMENT_FIELD_DEFINITION,
        })),
        config
      );

      if (!typeFields.length) {
        return [null, {}];
      }

      return [
        `${node.name.value} = TypedDict("${
          node.name.value
        }", { ${typeFields.join(", ")} })`,
        mergeImports(imports, { typing: ["TypedDict"] }),
      ];
    },
  [ExtraKind.OBJECT_TYPE_ARGUMENT_DEFINITION]:
    function handleObjectArgumentDefinitionNode(
      node: ObjectTypeDefinitionNode,
      config: ActualFromSchemaConfig
    ) {
      let [types, imports] = listToPython(
        node.fields?.map((f) => ({
          ...f,
          kind: ExtraKind.ARGUMENT_OBJECT_FIELD_DEFINITION,
        })),
        config
      );

      if (!types.length) {
        return [null, {}];
      }

      return [
        [`class ${node.name.value}__Arguments:`, ...types].join(`\n${indent}`),
        imports,
      ];
    },
  [Kind.SCALAR_TYPE_DEFINITION]: noopHandler,
  [Kind.INTERFACE_TYPE_DEFINITION]: noopHandler,
  [Kind.NON_NULL_TYPE]: function handleNonNullTypeNode(
    node: NonNullTypeNode,
    config: ActualFromSchemaConfig
  ) {
    return toPython(node.type, config);
  },
  [Kind.LIST_TYPE]: function handleNonNullTypeNode(
    node: NonNullTypeNode,
    config: ActualFromSchemaConfig
  ) {
    const [code, imports] = toPython(node.type, config);

    return [`List[${code}]`, mergeImports(imports, { typing: ["List"] })];
  },
  [Kind.NAMED_TYPE]: function handleNamedTypeNode(
    node: NamedTypeNode,
    config: ActualFromSchemaConfig
  ) {
    const typeMap = { ...pythonBuiltinTypes, ...config.extraTypes };

    if (config.wrapWithType) {
      return [
        typeMap[node.name.value] || `Type["${node.name.value}"]`,
        { typing: new Set(["Type"]) },
      ];
    }

    return [typeMap[node.name.value] || `"${node.name.value}"`, {}];
  },
  [Kind.INPUT_VALUE_DEFINITION]: function handleInputValueDefinitionNode(
    node: InputValueDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    const [code, imports] = toPython(node.type, config);

    return [`${node.name.value}: ${code || "None"}`, imports];
  },
  [Kind.FIELD_DEFINITION]: function handleFieldDefinitionNode(
    node: FieldDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    const [code, imports] = toPython(node.type, config);

    return [`${node.name.value}: ${code}`, imports];
  },
  [Kind.UNION_TYPE_DEFINITION]: function handleUnionTypeDefinitionNode(
    node: UnionTypeDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    let [types, imports] = listToPython(node.types, config);

    return [
      `${node.name.value} = Union[${types.join(", ")}]`,
      mergeImports(imports, { typing: ["Union"] }),
    ];
  },
  [Kind.ENUM_VALUE_DEFINITION]: function handleEnumValueDefinitionNode(
    node: EnumValueDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    return [`"${node.name.value}"`, {}];
  },
  [Kind.ENUM_TYPE_DEFINITION]: function handleEnumTypeDefinitionNode(
    node: EnumTypeDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    let [values, imports] = listToPython(node.values, config);

    if (!values.length) {
      return [null, {}];
    }

    return [
      `${node.name.value} = Literal[${values.join(", ")}]`,
      mergeImports({}, mergeImports(imports, { typing: ["Literal"] })),
    ];
  },
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]:
    function handleInputObjectTypeDefinitionNode(
      node: InputObjectTypeDefinitionNode,
      config: ActualFromSchemaConfig
    ) {
      let [fields, imports] = listToPython(node.fields, config);
      let parentType = "";
      let decorators = "";

      if (config.super) {
        parentType = `(${config.super})`;
      }

      if (config.decorators?.length) {
        decorators =
          config.decorators.map((d) => d.replace(/^[^@]/m, "@$&")).join("\n") +
          "\n";
      }

      return [
        `${decorators}class ${node.name.value}${parentType}:
${indent}${fields.length ? fields.join(`\n${indent}`) : "pass"}`,
        imports,
      ];
    },
  [Kind.OBJECT_TYPE_DEFINITION]: function handleObjectTypeDefinitionNode(
    node: ObjectTypeDefinitionNode,
    config: ActualFromSchemaConfig
  ) {
    let [fields, imports1] = listToPython(node.fields, config);
    let parentType = "";
    let decorators = "";

    if (config.super) {
      parentType = `(${config.super})`;
    }

    if (config.decorators?.length) {
      decorators =
        config.decorators.map((d) => d.replace(/^[^@]/m, "@$&")).join("\n") +
        "\n";
    }

    const [objectArgumentType, imports2] = toPython(
      {
        ...node,
        kind: ExtraKind.OBJECT_TYPE_ARGUMENT_DEFINITION,
      },
      config
    );

    return [
      [
        `${decorators}class ${node.name.value}${parentType}:
${indent}${fields.length ? fields.join(`\n${indent}`) : "pass"}`,
        objectArgumentType,
      ]
        .filter(Boolean)
        .join("\n\n"),
      mergeImports(imports1, imports2),
    ];
  },
};

function patchNode(node) {
  if (node.astNode) {
    node = node.astNode;
  }

  if (
    [
      Kind.FIELD_DEFINITION,
      Kind.LIST_TYPE,
      Kind.INPUT_VALUE_DEFINITION,
      ExtraKind.ARGUMENT_FIELD_DEFINITION,
    ].includes(node.kind)
  ) {
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

function listToPython(
  nodeList,
  config: ActualFromSchemaConfig
): [string[], Imports] {
  const items = [];
  let imports = {};

  if (config.extraImports) {
    imports = mergeImports(imports, config.extraImports);
  }

  for (const node of nodeList || []) {
    const [code, currentImports] = toPython(node, config);

    if (!code) {
      continue;
    }

    imports = mergeImports(imports, currentImports);
    items.push(code);
  }

  return [items, imports];
}

const toPython = (
  node,
  config: ActualFromSchemaConfig
): [string | null, Imports] => {
  node = patchNode(node);

  if (!node.kind) {
    return [null, {}];
  }

  const handler = nodeHandlers[node.kind];

  if (!handler) {
    console.warn(`Could not find handler for ${node.kind}`);

    return [null, {}];
  }

  return handler(node, config);
};

export interface FromSchemaConfig {
  decorators?: string[];
  super?: string;
  extraImports?: Record<string, string[]>;
  extraTypes?: Record<string, string>;
}

interface InternalConfig {
  wrapWithType?: true;
}

type ActualFromSchemaConfig = InternalConfig & FromSchemaConfig;

export function fromSchema(
  schema: GraphQLSchema,
  config: FromSchemaConfig = {}
): string {
  const typeMap = schema.getTypeMap();
  const [items, imports] = listToPython(Object.values(typeMap), config);

  const importStatements = Object.entries(imports)
    .map(
      ([module, items]) =>
        `from ${module} import ${Array.from(items).sort().join(", ")}`
    )
    .join("\n");

  return [importStatements, ...items].filter(Boolean).join("\n\n");
}
