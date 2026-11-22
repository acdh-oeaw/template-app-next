import { isIPv4, isIPv6 } from "node:net";

/**
 * The address of the client, from the `x-forwarded-for` header. Each proxy appends the address it received the request
 * from, so the entry `trustedProxyCount` from the end was added by the outermost trusted proxy, and entries before it
 * can be chosen by the client. Next.js sets the header to the address of the connection only when it is missing, so
 * without a trusted proxy a client can choose its address.
 */
export function getClientAddress(forwardedFor: string | null, trustedProxyCount: number): string | null {
	if (forwardedFor == null) {
		return null;
	}

	const entries = forwardedFor.split(",").map((entry) => entry.trim());
	const address = entries.at(-Math.max(trustedProxyCount, 1));

	return address == null || address === "" ? null : address;
}

/**
 * A rate limiting key for an address. IPv6 addresses use their /64 prefix, because a client usually has a whole /64
 * network, and could otherwise use a new address for each request.
 */
export function getAddressKey(address: string): string {
	const mappedIPv4Prefix = "::ffff:";

	/** An IPv4 address of a dual-stack socket. */
	if (address.toLowerCase().startsWith(mappedIPv4Prefix) && isIPv4(address.slice(mappedIPv4Prefix.length))) {
		return address.slice(mappedIPv4Prefix.length);
	}

	if (!isIPv6(address)) {
		return address;
	}

	const [head = "", tail = ""] = address.toLowerCase().split("::");
	const headGroups = head === "" ? [] : head.split(":");
	const tailGroups = address.includes("::") && tail !== "" ? tail.split(":") : [];
	const missing = 8 - headGroups.length - tailGroups.length;
	const groups = [...headGroups, ...Array.from({ length: missing }, () => "0"), ...tailGroups];

	return `${groups
		.slice(0, 4)
		.map((group) => group.replace(/^0+(?=.)/, ""))
		.join(":")}::/64`;
}
