import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Arguments", (): void => {
  it("is output as a literal string union", async (): Promise<void> => {
    const input = `
    type Hello {
      greeting(lang: String!, region: String, person: Person!): String
    }

    type Person {
      name: String!
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema))
      .toEqual(`from typing import Optional, Type, TypedDict

class Hello:
    greeting: Optional[str]

class Hello__Arguments:
    greeting = TypedDict("greeting", { "lang": str, "region": Optional[str], "person": Type["Person"] })

class Person:
    name: str`);
  });
});
