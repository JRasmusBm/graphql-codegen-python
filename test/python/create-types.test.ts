import * as ast from "../../lib/ast";
import * as python from "../../lib/python";

describe("Create Types", (): void => {
  it("No fields", async (): Promise<void> => {
    const inputAst: ast.AST = {
      nodes: [{ kind: "type", name: "Hello" }],
    };

    expect(python.fromAST(inputAst)).toEqual(`class Hello:
    pass`);
  });
});
