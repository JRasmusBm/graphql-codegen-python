import { GraphQLSchema } from "graphql";
import * as ast from "./ast"


import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

interface PluginConfig {}

export function generatePython({ nodes }: ast.AST): string {
  return nodes.map((n) => n.name).join("\n");
}

export const plugin: PluginFunction<Partial<PluginConfig>, string> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: PluginConfig
) => {
  const internalRepresentation = ast.fromSchema(schema);

  const pythonCode = generatePython(internalRepresentation);

  return pythonCode;
};
