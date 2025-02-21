export function createThrottler(delay: number) {
	let lastCall = 0;

	return async function call<T>(fn: () => Promise<T>): Promise<T> {
		const now = Date.now();
		const waitTime = delay - (now - lastCall);

		if (waitTime > 0) {
			await new Promise((resolve) => {
				return setTimeout(resolve, waitTime);
			});
		}

		lastCall = Date.now();

		return fn();
	};
}
