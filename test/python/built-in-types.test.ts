import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Built-in types", (): void => {
  interface Case {
    graphqlType: string;
    pythonType: string;
    imports?: string;
  }

  const cases: Case[] = [
    { graphqlType: "Int!", pythonType: "int" },
    { graphqlType: "Float!", pythonType: "float" },
    { graphqlType: "String!", pythonType: "str" },
    { graphqlType: "Boolean!", pythonType: "bool" },
    { graphqlType: "ID!", pythonType: "str" },
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
