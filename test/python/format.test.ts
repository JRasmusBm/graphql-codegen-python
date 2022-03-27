import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Format", (): void => {
  it("Indent class fields correctly", async (): Promise<void> => {
    const input = `
    type Hello {
      greeting: String!
      duration: Int
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema)).toEqual(`from typing import Optional

class Hello:
    greeting: str
    duration: Optional[int]`);
  });
});
