const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3600,
  apiKey: process.env.API_KEY
};

export default config;
