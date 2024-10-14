import { hash, verify } from "@node-rs/argon2";

import { argonConfig } from "@/config/auth.config";

export function createPasswordHash(password: string): Promise<string> {
	return hash(password, argonConfig);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
	return verify(passwordHash, password, argonConfig);
}
