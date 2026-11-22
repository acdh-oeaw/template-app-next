import { describe, expect, test } from "bun:test";

import { getAddressKey, getClientAddress } from "#/lib/rate-limit/client-address.ts";

describe("getClientAddress", () => {
	test("returns the entry that the outermost trusted proxy added", () => {
		expect(getClientAddress("203.0.113.1, 198.51.100.1, 10.0.0.1", 1)).toBe("10.0.0.1");
		expect(getClientAddress("203.0.113.1, 198.51.100.1, 10.0.0.1", 2)).toBe("198.51.100.1");
	});

	test("returns the last entry without a trusted proxy", () => {
		expect(getClientAddress("203.0.113.1", 0)).toBe("203.0.113.1");
	});

	test("returns `null` when there are fewer entries than trusted proxies", () => {
		expect(getClientAddress("203.0.113.1", 2)).toBeNull();
		expect(getClientAddress(null, 1)).toBeNull();
		expect(getClientAddress("", 1)).toBeNull();
	});
});

describe("getAddressKey", () => {
	test("keeps IPv4 addresses", () => {
		expect(getAddressKey("203.0.113.1")).toBe("203.0.113.1");
	});

	test("uses IPv4 addresses of dual-stack sockets", () => {
		expect(getAddressKey("::ffff:203.0.113.1")).toBe("203.0.113.1");
		expect(getAddressKey("::FFFF:203.0.113.1")).toBe("203.0.113.1");
	});

	test("uses the /64 prefix of IPv6 addresses", () => {
		expect(getAddressKey("2001:db8:1:2:3:4:5:6")).toBe("2001:db8:1:2::/64");
		expect(getAddressKey("2001:0DB8:0001:0002::1")).toBe("2001:db8:1:2::/64");
		expect(getAddressKey("2001:db8::1")).toBe("2001:db8:0:0::/64");
		expect(getAddressKey("::1")).toBe("0:0:0:0::/64");
	});
});
