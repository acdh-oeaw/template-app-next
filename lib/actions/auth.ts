"use server";

import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";

import { signIn as _signIn, signOut as _signOut } from "@/lib/auth";

type SignInState =
	| {
			status: "error";
			message: string;
	  }
	| {
			status: "initial";
	  }
	| {
			status: "success";
			message: string;
	  };

export async function signIn(prevState: SignInState, formData: FormData): Promise<SignInState> {
	const t = await getTranslations("signIn");

	try {
		await _signIn("credentials", formData);

		return { status: "success", message: t("success") };
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin": {
					return { status: "error", message: t("errors.CredentialsSignin") };
				}

				default: {
					return { status: "error", message: t("errors.Default") };
				}
			}
		}

		throw error;
	}
}

export async function signOut(): Promise<void> {
	await _signOut();
}
