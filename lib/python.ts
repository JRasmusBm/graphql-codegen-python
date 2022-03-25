import * as ast from "./ast";

export function fromAST({ nodes }: ast.AST): string {
  return nodes.map((n) => n.name).join("\n");
}
