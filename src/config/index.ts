const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3080,
  apiKey: process.env.API_KEY
};

export default config;
