# graphql-codegen-python

> DISCLAIMER: This software is at the alpha stage. Feel free to experiment with
> it and to contribute, but do not expect it to work at this stage.

## Motivation

Working with GraphQL over multiple years has shown that it can be very
beneficial to make the schema files first class. One of the biggest advantages
to working with GraphQL is its strongly typed schema.

There are frameworks and tools in the Python ecosystem that are able to perform
type validation at run-time, but ideally we would want mismatches between
schema, operations and resolvers to be caught with static type checks.

Leveraging [GraphQL Code Generator](https://www.graphql-code-generator.com/),
this project aims to provide full Python type generation from GraphQL schema
files.

## Installation & Usage

1.  Clone the repository (or add it as a submodule)
2.  In the repository, run:
    1.  Run `npm i`
    2.  Run `npm run build`
3.  Add a graphql.codegen.yaml file to the root of the project, similar to the one below

```yaml
overwrite: true
schema: "<path-to-folder-with-graphql-schema-files>"
generates:
  <./relative/path/to/generated-types.py>:
    plugins:
      - "./dist/lib/index.js"
```

5. Run `npx @graphql-codegen/cli -c ./graphql-codegen.yaml`
