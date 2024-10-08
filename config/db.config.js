import { env } from "./env.config.js";

export const credentials = {
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	host: env.DB_HOST,
	port: env.DB_PORT,
	database: env.DB_NAME,
};
