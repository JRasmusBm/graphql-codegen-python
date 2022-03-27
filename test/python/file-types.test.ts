import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Field Types", (): void => {
  interface Case {
    graphqlType: string;
    pythonType: string;
  }

  const cases: Case[] = [
    { graphqlType: "String!", pythonType: "str" },
    { graphqlType: "String", pythonType: "Optional[str]" },
  ];

  cases.forEach(({ graphqlType, pythonType }) => {
    it(`${graphqlType} -> ${pythonType}`, async (): Promise<void> => {
      const input = `
    type Hello {
      greeting: ${graphqlType}
    }
`;

      const schema = makeExecutableSchema({ typeDefs: input });

      expect(python.fromSchema(schema)).toEqual(`class Hello:
    greeting: ${pythonType}`);
    });
  });
});
