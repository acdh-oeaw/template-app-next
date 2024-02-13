import { createUrl } from "@acdh-oeaw/lib";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { publicRoutes } from "@/config/auth.config";
import { getNormalizedPathname } from "@/lib/get-normalized-pathname";
import { signInSchema } from "@/lib/schemas/auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
	callbacks: {
		/**
		 * Returning `false` does not automatically trigger a redirect to the sign-in page, when
		 * composing middlewares, hence the explicit redirects.
		 *
		 * @see https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/lib/index.ts#L171-L201
		 */
		authorized({ auth, request }) {
			const isSignedIn = auth != null;
			const pathname = getNormalizedPathname(request.nextUrl.pathname);

			const isAuthRoute = pathname.startsWith("/auth/");
			if (isAuthRoute) return true;

			const isPublicRoute = publicRoutes.some((matcher) => {
				if (typeof matcher === "string") return pathname === matcher;
				return matcher.test(pathname);
			});
			if (isPublicRoute) return true;

			if (isSignedIn) return true;

			const signInUrl = createUrl({ pathname: "/auth/sign-in", baseUrl: request.nextUrl });
			signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);

			return NextResponse.redirect(signInUrl);
		},
		signIn() {
			return true
		},
		jwt({ token }) {
			return token
		},
		session({ session}) {
			return session
		}
	},
	pages: {
		signIn: "/auth/sign-in",
	},
	providers: [
		Credentials({
			authorize(credentials, _request) {
				const result = signInSchema.safeParse(credentials);

				if (!result.success) return null;

				// TODO: add example for credentials sign-in

				const user = {
					id: "6a5594f8-615c-4f68-98f9-29dc9bb9b997",
					email: result.data.email,
				};

				return user;
			},
			/** Only used on built-in sign-in page. */
			credentials: {
				email: {
					label: "Email",
					placeholder: "Email",
					required: true,
					type: "email",
				},
				password: {
					label: "Password",
					placeholder: "Password",
					required: true,
					type: "password",
				},
			},
			name: "ACDH-CH",
		}),
	],
	session: {
		strategy: "jwt",
	},
	/** Only used on built-in auth pages. */
	theme: {
		logo: "/assets/images/logo.svg",
	},
});
