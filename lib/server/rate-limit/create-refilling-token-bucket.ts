export function createRefillingTokenBucket(capacity: number, refillRate: number) {
	let tokens = capacity;
	let lastRefill = Date.now();

	function refill(): void {
		const now = Date.now();
		const tokensToAdd = Math.floor(((now - lastRefill) / 1000) * refillRate);

		if (tokensToAdd > 0) {
			tokens = Math.min(capacity, tokens + tokensToAdd);
			lastRefill = now;
		}
	}

	function consume(count: number): boolean {
		refill();

		if (tokens >= count) {
			tokens -= count;
			return true;
		}

		return false;
	}

	return {
		consume,
	};
}
