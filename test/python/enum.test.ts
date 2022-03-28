import { makeExecutableSchema } from "@graphql-tools/schema";
import * as python from "../../lib/python";

describe("Enum type", (): void => {
  it("is output as a literal string union", async (): Promise<void> => {
    const input = `
    enum Hello {
      greeting
      dismissal
    }
`;

    const schema = makeExecutableSchema({ typeDefs: input });

    expect(python.fromSchema(schema)).toEqual(`from typing import Literal

Hello = Literal["greeting", "dismissal"]`);
  });
});
