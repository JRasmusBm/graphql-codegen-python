import { transform } from "../../lib";
import { makeExecutableSchema } from "@graphql-tools/schema";

describe("Type discovery", (): void => {
  it("Finds nullable types", async (): Promise<void> => {
    const input = `
    type Query {
      hello: Hello
    }

    type Hello {
      check: Boolean!
    }
    `;

    const schema = makeExecutableSchema({ typeDefs: input });
    const internalRepresentation = transform(schema);

    expect(
      internalRepresentation.nodes
        .filter((n) => n.kind === "type")
        .map((n) => n.name)
    ).toEqual(["Query", "Hello"]);
  });

  it("Finds non-nullable types", async (): Promise<void> => {
    const input = `
    type Query {
      hello: Hello!
    }

    type Hello {
      check: Boolean!
    }
    `;

    const schema = makeExecutableSchema({ typeDefs: input });
    const internalRepresentation = transform(schema);

    expect(
      internalRepresentation.nodes
        .filter((n) => n.kind === "type")
        .map((n) => n.name)
    ).toEqual(["Query", "Hello"]);
  });

  it("Finds nullable list types", async (): Promise<void> => {
    const input = `
    type Query {
      hello: [Hello]!
    }

    type Hello {
      check: Boolean!
    }
    `;

    const schema = makeExecutableSchema({ typeDefs: input });
    const internalRepresentation = transform(schema);

    expect(
      internalRepresentation.nodes
        .filter((n) => n.kind === "type")
        .map((n) => n.name)
    ).toEqual(["Query", "Hello"]);
  });

  it("Finds non-nullable list types", async (): Promise<void> => {
    const input = `
      type Query {
        hello: [Hello]
      }

      type Hello {
        check: Boolean!
      }
      `;

    const schema = makeExecutableSchema({ typeDefs: input });
    const internalRepresentation = transform(schema);

    expect(
      internalRepresentation.nodes
        .filter((n) => n.kind === "type")
        .map((n) => n.name)
    ).toEqual(["Query", "Hello"]);
  });
});
