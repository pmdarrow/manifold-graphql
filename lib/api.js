import axios from 'axios';
import buildURL from 'axios/lib/helpers/buildURL';
import camelcaseKeys from 'camelcase-keys';

const CATALOG_URL = 'http://api.catalog.arigato.tools/v1';
const MARKETPLACE_URL = 'http://api.marketplace.arigato.tools/v1';
const IDENTITY_URL = 'http://api.identity.arigato.tools/v1';

axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
// Reject only if the status code is greater than or equal to 500
axios.defaults.validateStatus = status => status < 500;
axios.interceptors.request.use(request => {
  const url = buildURL(request.url, request.params);
  console.log(`Request ${request.method.toUpperCase()} ${url}`);
  return request;
});

export const getProviders = async () => {
  const response = await axios.get(`${CATALOG_URL}/providers`);
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getProvider = async id => {
  const response = await axios.get(`${CATALOG_URL}/providers/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getProducts = async (providerId = null) => {
  const config = providerId ? { params: { provider_id: providerId } } : {};
  const response = await axios.get(`${CATALOG_URL}/products`, config);
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getProduct = async id => {
  const response = await axios.get(`${CATALOG_URL}/products/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body }, { deep: true });
};

export const getPlans = async productId => {
  const response = await axios.get(`${CATALOG_URL}/plans`, { params: { product_id: productId } });
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getPlan = async id => {
  const response = await axios.get(`${CATALOG_URL}/plans/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getRegion = async id => {
  const response = await axios.get(`${CATALOG_URL}/regions/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getProject = async id => {
  const response = await axios.get(`${MARKETPLACE_URL}/projects/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getResources = async label => {
  const response = await axios.get(`${MARKETPLACE_URL}/resources/`, {
    params: { label }
  });
  return response.data.map(item => camelcaseKeys({ id: item.id, ...item.body }));
};

export const getResource = async id => {
  const response = await axios.get(`${MARKETPLACE_URL}/resources/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const patchResource = async (id, data) => {
  const response = await axios.patch(`${MARKETPLACE_URL}/resources/${id}`, { id, body: data });
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getCredentials = async resourceId => {
  const response = await axios.get(`${MARKETPLACE_URL}/credentials`, {
    params: { resource_id: resourceId }
  });
  const body = response.data[0].body;
  const values = Object.entries(body.values).map(([key, value]) => ({ key, value }));
  return camelcaseKeys({ id: response.data[0].id, ...body, values });
};

export const getSelf = async () => {
  const response = await axios.get(`${IDENTITY_URL}/self`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getTeam = async id => {
  const response = await axios.get(`${IDENTITY_URL}/teams/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};
