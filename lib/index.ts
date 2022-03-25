import { GraphQLSchema } from "graphql";
import * as ast from "./ast";
import * as python from "./python";

import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

interface PluginConfig {}

export const plugin: PluginFunction<Partial<PluginConfig>, string> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: PluginConfig
) => {
  const internalRepresentation = ast.fromSchema(schema);

  const pythonCode = python.fromAST(internalRepresentation);

  return pythonCode;
};
