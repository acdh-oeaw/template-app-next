import "next-auth";

declare module "next-auth" {
	interface User {}

	interface Account {}

	interface Session {}
}

declare module "next-auth/jwt" {
	interface JWT {}
}
