const { ApolloServer, gql } = require("apollo-server");
const { createTestClient } = require("apollo-server-testing");

const { FederatedGateway } = require("..");

describe("federated-gateway", () => {
  let aSchema;
  let bSchema;
  let gateway;
  let server;
  beforeEach(() => {
    aSchema = {
      typeDefs: gql`
        type Query {
          aPing: String
        }
      `,
      resolvers: {
        Query: {
          aPing: () => "apong",
        },
      },
    };

    bSchema = {
      typeDefs: gql`
        type Query {
          bPing: String
        }
      `,
      resolvers: {
        Query: {
          bPing: () => "bpong",
        },
      },
    };

    gateway = new FederatedGateway({
      serviceList: [
        {
          name: "a",
          schema: aSchema,
        },
        {
          name: "b",
          schema: bSchema,
        },
      ],
    });
    server = new ApolloServer({
      gateway,
      subscriptions: false,
      playground: false,
      introspection: true,
    });
  });

  it("executes federated service", async () => {
    const { query } = createTestClient(server);

    const response = await query({
      query: `#graphql
        {
          aPing
          bPing
        }
      `,
    });

    expect(response.data.aPing).toEqual("apong");
    expect(response.data.bPing).toEqual("bpong");
  });
});
