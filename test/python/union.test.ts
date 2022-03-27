import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Union", (): void => {
  it("Gets converted into a Python union", async (): Promise<void> => {
    const input = `
type Hello  {
  message: String!
}

union Message = Hello | String
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema)).toEqual(`from typing import Union

class Hello:
    message: str

Message = Union[Hello, str]`);
  });
});
