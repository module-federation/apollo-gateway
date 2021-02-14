import { buildFederatedSchema } from "@apollo/federation";
import {
  ApolloGateway,
  LocalGraphQLDataSource,
  RemoteGraphQLDataSource,
} from "@apollo/gateway";

/**
 * @typedef {import("graphql").DocumentNode} DocumentNode
 * @typedef {import("apollo-graphql").GraphQLSchemaModule} GraphQLSchemaModule
 * @typedef {import("apollo-graphql").GraphQLResolverMap} GraphQLResolverMap
 * @typedef {import("@apollo/gateway").ServiceEndpointDefinition} ServiceEndpointDefinition
 */

/**
 * @typedef {object} LegacySchemaModule
 * @property {DocumentNode | DocumentNode[]} typeDefs
 * @property {GraphQLResolverMap} resolvers
 * {
  typeDefs: DocumentNode | DocumentNode[];
  resolvers?: GraphQLResolverMap<any>;
 */

/**
 * @typedef {object} FederatedServiceDefinition
 * @property {string} name
 * @property {DocumentNode | (GraphQLSchemaModule | DocumentNode)[] | LegacySchemaModule} schema
 */

/**
 * @typedef {import("@apollo/gateway").GatewayConfig} FederatedGatewayConfig
 * @property {Array<FederatedServiceDefinition | ServiceEndpointDefinition>} serviceList
 */

const DUMMY_URL = "https://";

export class FederatedGateway extends ApolloGateway {
  /**
   * @param {FederatedGatewayConfig} config
   */
  constructor(config) {
    if (config.serviceList) {
      config.serviceList = config.serviceList.map((service) => {
        if (!service.url) {
          return {
            url: DUMMY_URL,
            ...service,
          };
        }

        return service;
      });
    }

    super(config);
  }

  /**
   * @param {import("@apollo/gateway").ServiceEndpointDefinition} serviceDef
   */
  createDataSource(serviceDef) {
    if (serviceDef.url !== DUMMY_URL) {
      return new RemoteGraphQLDataSource({ url: serviceDef.url });
    }

    if (!serviceDef.schema) {
      throw new Error(`Invalid service definition for ${serviceDef.name}`);
    }

    return new LocalGraphQLDataSource(buildFederatedSchema(serviceDef.schema));
  }
}
