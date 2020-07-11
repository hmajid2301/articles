import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

const config = resolveConfig(tailwindConfig);
const { theme } = config;

export default config;
export { theme };
