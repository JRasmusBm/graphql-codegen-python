import { GraphQLSchema } from "graphql";
import * as python from "./python";

import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

type PluginConfig = python.FromSchemaConfig

export const plugin: PluginFunction<Partial<PluginConfig>, string> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: PluginConfig
) => {
  return python.fromSchema(schema, config);
};
