import { createDemoBackendClient } from './demoBackend';

export const isUsingDemoBackend = true;

const backend = createDemoBackendClient();

export default backend;
