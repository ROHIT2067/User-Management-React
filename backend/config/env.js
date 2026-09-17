import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const jwtSecret = process.env.JWT_SECRET || process.env.SECRET;

const env = Object.freeze({
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: jwtSecret,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || jwtSecret,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
});

export default env;
