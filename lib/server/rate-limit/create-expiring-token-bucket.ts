export function createExpiringTokenBucket(capacity: number, refillRate: number, tokenTTL: number) {
	let tokens: Array<{ expiresAt: number }> = [];
	let lastRefill = Date.now();

	function refill(): void {
		const now = Date.now();
		const tokensToAdd = Math.floor(((now - lastRefill) / 1000) * refillRate);

		if (tokensToAdd > 0) {
			for (let i = 0; i < tokensToAdd; i++) {
				if (tokens.length < capacity) {
					tokens.push({ expiresAt: now + tokenTTL });
				}
			}

			lastRefill = now;
		}

		tokens = tokens.filter((token) => {
			return token.expiresAt > now;
		});
	}

	function consume(): boolean {
		refill();

		if (tokens.length > 0) {
			tokens.shift();
			return true;
		}

		return false;
	}

	return {
		consume,
	};
}
