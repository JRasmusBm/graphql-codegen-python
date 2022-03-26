import {
  GraphQLNamedType,
  GraphQLSchema,
  ASTKindToNode,
  Kind,
  TypeNode,
} from "graphql";

type InternalNode = { kind: "type"; name: string };

export type ASTKindToInternalNode = {
  [TNode in InternalNode as TNode['kind']]: TNode;
};

export interface AST {
  nodes: InternalNode[];
}

function extractTypeName(typeNode: TypeNode) {
  if (typeNode.kind === Kind.NAMED_TYPE) {
    return typeNode.name.value;
  }

  return extractTypeName(typeNode.type);
}

type NodeHandlers = {
  [Key in GraphQLNamedType["astNode"]["kind"]]?: (
    node: ASTKindToNode[Key]
  ) => [InternalNode, string[]];
};
const nodeHandlers: NodeHandlers = {
  [Kind.OBJECT_TYPE_DEFINITION]: (node) => {
    return [
      { kind: "type", name: node.name.value },
      node.fields?.map((f) => extractTypeName(f.type)).filter(Boolean),
    ];
  },
};

function fromNode(node: GraphQLNamedType): [InternalNode | null, string[]] {
  const nodeHandler = nodeHandlers[node?.astNode?.kind];

  if (!nodeHandler) {
    return [null, []];
  }

  return nodeHandler(node.astNode as any); // TODO
}

export function fromSchema(schema: GraphQLSchema): AST {
  const typeMap = schema.getTypeMap();

  const nodes = [];
  let dependencies = ["Query", "Mutation"];

  while (dependencies.length) {
    const dep = typeMap[dependencies.pop()];

    if (!dep) {
      continue;
    }

    const [node, deps] = fromNode(dep);

    if (!node) {
      continue;
    }

    nodes.push(node);
    dependencies = [...dependencies, ...deps];
  }
  return { nodes };
}
