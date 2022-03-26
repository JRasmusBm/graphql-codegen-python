import * as ast from "../../lib/ast";
import * as python from "../../lib/python";

describe("Create Types", (): void => {
  it("No fields", async (): Promise<void> => {
    const inputAst: ast.AST = {
      nodes: [{ kind: "type", name: "Hello", fields: [] }],
    };

    expect(python.fromAST(inputAst)).toEqual(`class Hello:
    pass`);
  });

  it("Two fields", async (): Promise<void> => {
    const inputAst: ast.AST = {
      nodes: [
        {
          kind: "type",
          name: "Hello",
          fields: [
            ["person", { name: "Person", optional: true }],
            ["greeting", { name: "Greeting" }],
          ],
        },
      ],
    };

    expect(python.fromAST(inputAst)).toEqual(`class Hello:
    person: Optional[Person]
    greeting: Greeting`);
  });
});
