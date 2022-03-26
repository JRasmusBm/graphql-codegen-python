import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Create Types", (): void => {
  it("One required field", async (): Promise<void> => {
    const input = `
    type Hello {
      greeting: String!
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema)).toEqual(`class Hello:
    greeting: str`);
  });
});
