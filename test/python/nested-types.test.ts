import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Nested Types", (): void => {
  interface Case {
    graphqlType: string;
    pythonType: string;
    imports?: string;
  }

  const cases: Case[] = [
    { graphqlType: "String!", pythonType: "str" },
    {
      graphqlType: "String",
      pythonType: "Optional[str]",
      imports: "from typing import Optional",
    },
    {
      graphqlType: "[String!]!",
      pythonType: "List[str]",
      imports: "from typing import List",
    },
    {
      graphqlType: "[String]",
      pythonType: "Optional[List[Optional[str]]]",
      imports: "from typing import List, Optional",
    },
    {
      graphqlType: "[String]!",
      pythonType: "List[Optional[str]]",
      imports: "from typing import List, Optional",
    },
  ];

  cases.forEach(({ graphqlType, pythonType, imports }) => {
    it(`${graphqlType} -> ${pythonType}`, async (): Promise<void> => {
      const input = `
    type Hello {
      greeting: ${graphqlType}
    }
`;

      const schema = makeExecutableSchema({ typeDefs: input });

      imports = imports ? imports + "\n\n" : "";

      expect(python.fromSchema(schema)).toEqual(`${imports}class Hello:
    greeting: ${pythonType}`);
    });
  });
});
