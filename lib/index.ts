import { GraphQLSchema } from "graphql";

import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

interface PluginConfig {}

interface InternalRepresentation {
  nodes: [];
}

function parseGraphql(): string {
  return "";
}

function transform(graphqlAst: string): InternalRepresentation {
  return { nodes: [] };
}

export function generatePython(
  internalRepresentation: InternalRepresentation
): string {
  return "hello world";
}

export const plugin: PluginFunction<Partial<PluginConfig>, string> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: PluginConfig
) => {
  console.dir(
    {
      file: "codegen/index.ts",
      line: 21,
      schema,
      documents,
      config,
    },
    { depth: 5 }
  );

  const graphqlAst = parseGraphql();

  console.dir(
    {
      file: "codegen/index.ts",
      line: 31,
      graphqlAst,
    },
    { depth: 5 }
  );

  const internalRepresentation = transform(graphqlAst);

  console.dir(
    {
      file: "codegen/index.ts",
      line: 39,
      internalRepresentation,
    },
    { depth: 5 }
  );

  const pythonCode = generatePython(internalRepresentation);

  console.dir(
    {
      file: "codegen/index.ts",
      line: 47,
      pythonCode,
    },
    { depth: 5 }
  );

  return pythonCode;
};
