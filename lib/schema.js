import { makeExecutableSchema } from 'graphql-tools';
import { getProviders, getProvider, getProducts, getProduct, getPlans, getPlan } from './api';

const typeDefs = `
  # A service provider in the Manifold marketplace
  type Provider {
    id: ID!
    name: String
    label: String
    logoUrl: String
    supportEmail: String
    documentationUrl: String
    products: [Product]
  }
  
  type FeatureType {
    name: String
    label: String
    type: String
  }
  
  type ValueProp {
    header: String
    body: String
  }
  
  # A product in the Manifold marketplace
  type Product {
    id: ID!
    name: String
    label: String
    logoUrl: String
    supportEmail: String
    documentationUrl: String 
    tagline: String
    valueProps: [ValueProp]
    images: [String]
    featureTypes: [FeatureType]
    provider: Provider
    plans: [Plan]
  }
  
  type FeatureValue {
    feature: String
    value: String
  }
  
  # A plan for a product in the Manifold marketplace
  type Plan {
    id: ID!
    name: String
    label: String
    features: [FeatureValue]
    trialDays: Int
    cost: Int
    provider: Provider
    product: Product
  }
  
  # The root of all... queries
  type Query {
    # List all providers
    allProviders: [Provider]
    
    # Fetch a single provider by ID
    provider(id: ID!): Provider
    
    # List all products
    allProducts: [Product]
    
    # Fetch a single product by ID
    product(id: ID!): Product
    
    # List all plans for a product
    allPlans(productId: ID!): [Plan]
    
    # Fetch a single plan by ID
    plan(id: ID!): Plan
  }
`;

const resolvers = {
  Query: {
    allProviders() {
      return getProviders();
    },
    provider(_, { id }) {
      return getProvider(id);
    },
    allProducts() {
      return getProducts();
    },
    product(_, { id }) {
      return getProduct(id);
    },
    allPlans(_, { productId }) {
      return getPlans(productId);
    },
    plan(_, { id }) {
      return getPlan(id);
    }
  },
  Provider: {
    products(provider) {
      return getProducts(provider.id);
    },
  },
  Product: {
    plans(product) {
      return getPlans(product.id);
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
