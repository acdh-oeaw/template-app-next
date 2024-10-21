/**
 * Note that in-memory rate limiters will only work if memory is persisted across requests.
 * It will not work in serverless environments.
 */

interface RefillBucket {
	count: number;
	refilledAt: number;
}

/**
 * Each user has their own bucket of tokens that gets refilled at a set interval.
 * A token is removed on every request until none is left and the request is rejected.
 * While a bit more complex than the fixed-window algorithm, it allows handling initial
 * bursts and processes requests more smoothly overall.
 *
 * @example
 *
 * ```ts
 * // Bucket that has 10 tokens max and refills at a rate of 2 tokens/sec.
 *
 * const bucket = new TokenBucket<string>(10, 2);
 *
 * if (!bucket.consume(ip, 1)) {
 *   throw new Error("Too many requests");
 * }
 * ```
 */
export class RefillingTokenBucket<_Key> {
	public max: number;
	public refillIntervalSeconds: number;

	constructor(max: number, refillIntervalSeconds: number) {
		this.max = max;
		this.refillIntervalSeconds = refillIntervalSeconds;
	}

	private storage = new Map<_Key, RefillBucket>();

	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key);

		if (bucket == null) {
			return true;
		}

		const now = Date.now();
		const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));

		if (refill > 0) {
			return Math.min(bucket.count + refill, this.max) >= cost;
		}

		return bucket.count >= cost;
	}

	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key);

		const now = Date.now();

		if (bucket == null) {
			bucket = {
				count: this.max - cost,
				refilledAt: now,
			};

			this.storage.set(key, bucket);

			return true;
		}

		const refill = Math.floor((now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000));
		bucket.count = Math.min(bucket.count + refill, this.max);
		bucket.refilledAt = now;

		if (bucket.count < cost) {
			return false;
		}

		bucket.count -= cost;
		this.storage.set(key, bucket);

		return true;
	}
}

interface ThrottlingCounter {
	index: number;
	updatedAt: number;
}

/**
 * After each failed attempt, the user has to wait longer before their next attempt.
 *
 * @example
 *
 * ```ts
 * // On each failed sign in attempt, the lockout time gets extended with a max of 5 minutes.
 *
 * const throttler = new Throttler<number>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
 *
 * if (!throttler.consume(userId)) {
 * 	 throw new Error("Too many requests");
 * }
 *
 * const validPassword = verifyPassword(password);
 *
 * if (!validPassword) {
 * 	 throw new Error("Invalid password");
 * }
 *
 * throttler.reset(user.id);
 * ```
 */
export class Throttler<_Key> {
	public timeoutSeconds: Array<number>;

	private storage = new Map<_Key, ThrottlingCounter>();

	constructor(timeoutSeconds: Array<number>) {
		this.timeoutSeconds = timeoutSeconds;
	}

	public consume(key: _Key): boolean {
		let counter = this.storage.get(key);

		const now = Date.now();

		if (counter == null) {
			counter = {
				index: 0,
				updatedAt: now,
			};

			this.storage.set(key, counter);

			return true;
		}

		const allowed = now - counter.updatedAt >= this.timeoutSeconds[counter.index]! * 1000;

		if (!allowed) {
			return false;
		}

		counter.updatedAt = now;
		counter.index = Math.min(counter.index + 1, this.timeoutSeconds.length - 1);
		this.storage.set(key, counter);

		return true;
	}

	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}

interface ExpiringBucket {
	count: number;
	createdAt: number;
}

/**
 *
 */
export class ExpiringTokenBucket<_Key> {
	public max: number;
	public expiresInSeconds: number;

	private storage = new Map<_Key, ExpiringBucket>();

	constructor(max: number, expiresInSeconds: number) {
		this.max = max;
		this.expiresInSeconds = expiresInSeconds;
	}

	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key);
		const now = Date.now();

		if (bucket == null) return true;

		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			return true;
		}

		return bucket.count >= cost;
	}

	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key) ?? null;

		const now = Date.now();

		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				createdAt: now,
			};

			this.storage.set(key, bucket);

			return true;
		}

		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			bucket.count = this.max;
		}

		if (bucket.count < cost) {
			return false;
		}

		bucket.count -= cost;
		this.storage.set(key, bucket);

		return true;
	}

	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}
