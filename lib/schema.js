import { makeExecutableSchema } from 'graphql-tools';
import {
  getProviders,
  getProvider,
  getProducts,
  getProduct,
  getPlans,
  getPlan,
  getRegion,
  getProject,
  getResource,
  getCredentials
} from './api';

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
  
  type Features {
    planChange: Boolean
    region: String
    sso: Boolean
  }
  
  type Integration {
    baseUrl: String
    ssoUrl: String
    features: Features
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
    integration: Integration
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
  
  # A region for a plan in the Manifold marketplace
  type Region {
    id: ID!
    name: String
    location: String
    platform: String
    priority: Int
  }
  
  type Owner {
    id: ID!
    type: String
  }
  
  # A project representing a collection of resources
  type Project {
    id: ID!
    name: String
    label: String
    description: String
    owner: Owner
  }
  
  # A resource / service instance
  type Resource {
    id: ID!
    name: String
    label: String
    source: String
    updatedAt: String
    plan: Plan
    product: Product
    project: Project
    region: Region
    owner: Owner
    credentials: Credentials
  }
  
  type KeyValuePair {
    key: String
    value: String
  }
  
  # The credentials for a resource
  type Credentials {
    id: ID!
    source: String
    updatedAt: String
    values: [KeyValuePair]
  }
  
  # The root of all... queries
  type Query {
    # List all providers
    providers: [Provider]
    
    # Fetch a single provider by ID
    provider(id: ID!): Provider
    
    # List all products
    products: [Product]
    
    # Fetch a single product by ID
    product(id: ID!): Product
    
    # List all plans for a product
    plans(productId: ID!): [Plan]
    
    # Fetch a single plan by ID
    plan(id: ID!): Plan
    
    # Fetch a single resource by ID
    resource(id: ID!): Resource
    
    # Get credentials for a resource
    credentials(resourceId: ID!): Credentials
  }
`;

const resolvers = {
  Query: {
    providers() {
      return getProviders();
    },
    provider(_, { id }) {
      return getProvider(id);
    },
    products() {
      return getProducts();
    },
    product(_, { id }) {
      return getProduct(id);
    },
    plans(_, { productId }) {
      return getPlans(productId);
    },
    plan(_, { id }) {
      return getPlan(id);
    },
    resource(_, { id }) {
      return getResource(id);
    },
    credentials(_, { resourceId }) {
      return getCredentials(resourceId);
    }
  },
  Provider: {
    products(provider) {
      return getProducts(provider.id);
    }
  },
  Product: {
    plans(product) {
      return getPlans(product.id);
    }
  },
  Project: {
    owner(project) {
      if (project.userId) {
        return { type: 'user', id: project.userId };
      }
      return { type: 'team', id: project.teamId };
    }
  },
  Resource: {
    plan(resource) {
      return getPlan(resource.planId);
    },
    product(resource) {
      return getProduct(resource.productId);
    },
    project(resource) {
      return getProject(resource.projectId);
    },
    region(resource) {
      return getRegion(resource.regionId);
    },
    owner(resource) {
      if (resource.userId) {
        return { type: 'user', id: resource.userId };
      }
      return { type: 'team', id: resource.teamId };
    },
    credentials(resource) {
      return getCredentials(resource.id);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
