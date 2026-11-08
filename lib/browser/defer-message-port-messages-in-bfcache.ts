/**
 * Firefox drops `MessagePort` messages posted while a page enters the bfcache, i.e. during `pagehide` and the
 * `focusout` that follows it. React's scheduler waits for its message before posting another one, so after the page is
 * restored, no update renders anymore, and client navigation silently does nothing. React Aria triggers this, because
 * it updates focus state on `focusout`, e.g. of the link that was clicked to leave the page.
 *
 * Messages posted while the page is hidden are held back, and posted once the page is restored.
 *
 * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=2077455}
 * @see {@link https://github.com/adobe/react-spectrum/issues/10459}
 */
export function deferMessagePortMessagesInBfcache(): void {
	if (!navigator.userAgent.includes("Firefox/")) {
		return;
	}

	// oxlint-disable-next-line typescript/unbound-method -- called with `Reflect.apply`
	const postMessage = MessagePort.prototype.postMessage;

	let pending: Array<() => void> | null = null;

	window.addEventListener("pagehide", (event) => {
		if (event.persisted) {
			pending = [];
		}
	});

	window.addEventListener("pageshow", (event) => {
		if (!event.persisted || pending == null) {
			return;
		}

		const queued = pending;
		pending = null;

		for (const post of queued) {
			post();
		}
	});

	MessagePort.prototype.postMessage = function (this: MessagePort, ...args: Array<unknown>) {
		if (pending != null) {
			pending.push(() => {
				Reflect.apply(postMessage, this, args);
			});

			return;
		}

		Reflect.apply(postMessage, this, args);
	} as typeof postMessage;
}
