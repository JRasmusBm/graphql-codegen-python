import {
  GraphQLNamedType,
  GraphQLSchema,
  ASTKindToNode,
  Kind,
  TypeNode,
} from "graphql";

import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

interface PluginConfig {}

type InternalRepresentationNode = { kind: "type"; name: string };

interface AST {
  nodes: InternalRepresentationNode[];
}

function extractTypeName(typeNode: TypeNode) {
  if (typeNode.kind === Kind.NAMED_TYPE) {
    return typeNode.name.value;
  }

  return extractTypeName(typeNode.type);
}

const handlers: {
  [Key in Kind]?: (
    astNode: ASTKindToNode[Key]
  ) => [InternalRepresentationNode, (string | null)[]];
} = {
  [Kind.OBJECT_TYPE_DEFINITION]: (node) => {
    return [
      { kind: "type", name: node.name.value },
      node.fields?.map((f) => extractTypeName(f.type)).filter(Boolean),
    ];
  },
};

function transformNode(
  node: GraphQLNamedType
): [InternalRepresentationNode | null, string[]] {
  const handler = handlers[node?.astNode?.kind];

  if (!handler) {
    return [null, []];
  }

  return handler(node.astNode as any);
}

export function transform(schema: GraphQLSchema): AST {
  const typeMap = schema.getTypeMap();

  const nodes = [];
  let dependencies = ["Query", "Mutation"];

  while (dependencies.length) {
    const dep = typeMap[dependencies.pop()];

    if (!dep) {
      continue;
    }

    const [node, deps] = transformNode(dep);

    if (!node) {
      continue;
    }

    nodes.push(node);
    dependencies = [...dependencies, ...deps];
  }
  return { nodes };
}

export function generatePython({ nodes }: AST): string {
  return nodes.map((n) => n.name).join("\n");
}

export const plugin: PluginFunction<Partial<PluginConfig>, string> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: PluginConfig
) => {
  const internalRepresentation = transform(schema);

  const pythonCode = generatePython(internalRepresentation);

  return pythonCode;
};
