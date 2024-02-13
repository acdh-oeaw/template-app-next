import { z } from "zod";

export const authSignInPageSearchParams = z.object({
	callbackUrl: z.string().url().optional().catch(undefined),
});

export type AuthSignInPageSearchParams = z.infer<typeof authSignInPageSearchParams>;

export const authErrorPageSearchParams = z.object({
	error: z.string().optional().catch(undefined),
});

export type AuthErrorPageSearchParams = z.infer<typeof authErrorPageSearchParams>;

export const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export type SignInSchema = z.infer<typeof signInSchema>;
