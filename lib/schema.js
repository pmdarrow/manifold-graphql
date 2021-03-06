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
  getResources,
  getResource,
  patchResource,
  patchCustomCredentials,
  getCredentials,
  getSelf,
  getTeam
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
  
  interface Owner {
    id: ID!
    type: String
    name: String
  }
  
  type User implements Owner {
    id: ID!
    type: String
    name: String
    email: String
    state: String
  }
  
  type Team implements Owner {
    id: ID!
    type: String
    name: String
    label: String
  }
  
  # The root of all queries
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
    
    # Fetch a single resource by ID or label
    resource(id: ID, label: String): Resource
    
    # Get credentials for a resource
    credentials(resourceId: ID!): Credentials
  }
  
  # The root of all mutations
  type Mutation {
    # Update a resource
    updateResource(id: ID!, name: String, label: String): Resource
    
    # Update custom credentials for a resource
    updateCustomCredentials(resourceId: ID!, key: String, value: String): Credentials
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
    async resource(_, { id, label }) {
      if (id) {
        return getResource(id);
      }
      return (await getResources(label))[0];
    },
    credentials(_, { resourceId }) {
      return getCredentials(resourceId);
    }
  },
  Mutation: {
    updateResource(_, { id, name, label }) {
      return patchResource(id, { name, label });
    },
    async updateCustomCredentials(_, { resourceId, key, value }) {
      await patchCustomCredentials(resourceId, { [key]: value });
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
    async owner(resource) {
      if (resource.userId) {
        return { type: 'user', ...(await getSelf()) };
      }
      return { type: 'team', ...(await getTeam(resource.teamId)) };
    }
  },
  Resource: {
    plan(resource) {
      // TODO: Might be better off creating separate CatalogResource and CustomResource types
      if (resource.source === 'catalog') {
        return getPlan(resource.planId);
      }
      return null;
    },
    product(resource) {
      if (resource.source === 'catalog') {
        return getProduct(resource.productId);
      }
      return null;
    },
    project(resource) {
      return getProject(resource.projectId);
    },
    region(resource) {
      if (resource.source === 'catalog') {
        return getRegion(resource.regionId);
      }
      return null;
    },
    async owner(resource) {
      if (resource.userId) {
        return { type: 'user', ...(await getSelf()) };
      }
      return { type: 'team', ...(await getTeam(resource.teamId)) };
    },
    credentials(resource) {
      return getCredentials(resource.id);
    }
  },
  Owner: {
    __resolveType(obj) {
      return obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;
