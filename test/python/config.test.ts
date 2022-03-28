import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Config", (): void => {
  describe("super", (): void => {
    it(`Uses correct syntax when not specified`, async (): Promise<void> => {
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

      expect(
        python.fromSchema(schema, {
          super: "BaseModel",
          extraImports: { pydantic: ["BaseModel"] },
        })
      ).toEqual(`from pydantic import BaseModel

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

      expect(python.fromSchema(schema, { super: "Object" }))
        .toEqual(`class Hello(Object):
    greeting: str`);
    });
  });
});
