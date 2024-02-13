import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { SignInForm } from "@/components/sign-in-form";
import type { Locale } from "@/config/i18n.config";
import { type AuthSignInPageSearchParams, authSignInPageSearchParams } from "@/lib/schemas/auth";

interface AuthSignInPageProps {
	params: {
		locale: Locale;
	};
	searchParams: AuthSignInPageSearchParams;
}

export async function generateMetadata(
	props: AuthSignInPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const t = await getTranslations({ locale, namespace: "AuthSignInPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function AuthSignInPage(props: AuthSignInPageProps): ReactNode {
	const { params, searchParams } = props;

	const { locale } = params;
	setRequestLocale(locale);

	const t = useTranslations("SignInPage");

	const { callbackUrl } = authSignInPageSearchParams.parse(searchParams);

	return (
		<MainContent className="container py-8">
			<h1>{t("title")}</h1>

			<SignInForm callbackUrl={callbackUrl} />
		</MainContent>
	);
}
