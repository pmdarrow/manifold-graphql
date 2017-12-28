import axios from 'axios';
import buildURL from 'axios/lib/helpers/buildURL';
import camelcaseKeys from 'camelcase-keys';

axios.interceptors.request.use(request => {
  const url = buildURL(request.url, request.params);
  console.log(`Request ${request.method.toUpperCase()} ${url}`);
  return request;
});

const URL = 'https://api.catalog.manifold.co/v1';

export const getProviders = async () => {
  const response = await axios.get(`${URL}/providers`);
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getProvider = async id => {
  const response = await axios.get(`${URL}/providers/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getProducts = async (providerId = null) => {
  const config = providerId ? { params: { provider_id: providerId } } : {};
  const response = await axios.get(`${URL}/products`, config);
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getProduct = async id => {
  const response = await axios.get(`${URL}/products/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};

export const getPlans = async productId => {
  const response = await axios.get(`${URL}/plans`, { params: { product_id: productId } });
  return response.data.map(p => camelcaseKeys({ id: p.id, ...p.body }));
};

export const getPlan = async id => {
  const response = await axios.get(`${URL}/plans/${id}`);
  return camelcaseKeys({ id: response.data.id, ...response.data.body });
};
