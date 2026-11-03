function randomBytes(length: number): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(length));
}

export const generate = {
	base64(length: number): () => string {
		return () => {
			return randomBytes(length).toBase64();
		};
	},
	hex(length: number): () => string {
		return () => {
			return randomBytes(length).toHex();
		};
	},
};
