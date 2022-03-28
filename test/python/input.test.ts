import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Input type", (): void => {
  it("is output as a class", async (): Promise<void> => {
    const input = `
    input Hello {
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
