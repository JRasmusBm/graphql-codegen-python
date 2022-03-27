import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Config", (): void => {
  it(`Uses correct syntax when no parent specified`, async (): Promise<void> => {
    const input = `
    type Hello {
      greeting: String!
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema)).toEqual(`class Hello:
    greeting: str`);
  });

  it(`Imports and uses external parent type correctly`, async (): Promise<void> => {
    const input = `
    type Hello {
      greeting: String!
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema, { super: {module:"pydantic", parentType:"BaseModel"} }))
      .toEqual(`from pydantic import BaseModel

class Hello(BaseModel):
    greeting: str`);
  });

  it(`Uses internal parent type correctly`, async (): Promise<void> => {
    const input = `
    type Hello {
      greeting: String!
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema, { super: { parentType:"Object"} }))
      .toEqual(`class Hello(Object):
    greeting: str`);
  });
});
