import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from "graphql";

import { getProviders, getProvider, getProducts, getProduct, getPlans, getPlan } from "./resolvers";

const NonNullID = new GraphQLNonNull(GraphQLID);

const ProviderType = new GraphQLObjectType({
  name: "Provider",
  description: "A service provider in the Manifold marketplace",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    label: {
      type: GraphQLString
    },
    products: {
      type: new GraphQLList(ProductType),
      resolve: provider => getProducts(provider.id)
    }
  })
});

const ProductType = new GraphQLObjectType({
  name: "Product",
  description: "A product in the Manifold marketplace",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    label: {
      type: GraphQLString
    },
    logoUrl: {
      type: GraphQLString
    },
    provider: {
      type: ProviderType,
      resolve: product => getProvider(product.providerId)
    },
    plans: {
      type: new GraphQLList(PlanType),
      resolve: product => getPlans(product.id)
    }
  })
});

const PlanType = new GraphQLObjectType({
  name: "Plan",
  description: "A plan for a product in the Manifold marketplace",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    label: {
      type: GraphQLString
    },
    cost: {
      type: GraphQLInt
    },
    product: {
      type: ProductType,
      resolve: plan => getProduct(plan.productId)
    }
  })
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  description: "The root of all... queries",
  fields: () => ({
    allProviders: {
      type: new GraphQLList(ProviderType),
      description: "List all providers",
      resolve: getProviders
    },
    provider: {
      type: ProviderType,
      description: "Fetch a single provider by ID",
      args: {
        id: { type: NonNullID }
      },
      resolve: (root, args) => getProvider(args.id)
    },
    allProducts: {
      type: new GraphQLList(ProductType),
      description: "List all products",
      resolve: getProducts
    },
    product: {
      type: ProductType,
      description: "Fetch a single product by ID",
      args: {
        id: { type: NonNullID }
      },
      resolve: (root, args) => getProduct(args.id)
    },
    allPlans: {
      type: new GraphQLList(PlanType),
      description: "List all plans for a product",
      args: {
        productId: { type: NonNullID }
      },
      resolve: (root, args) => getPlans(args.productId)
    },
    plan: {
      type: PlanType,
      description: "Fetch a single plan by ID",
      args: {
        id: { type: NonNullID }
      },
      resolve: (root, args) => getPlan(args.id)
    }
  })
});

const schema = new GraphQLSchema({
  query: QueryType
});

export default schema;
