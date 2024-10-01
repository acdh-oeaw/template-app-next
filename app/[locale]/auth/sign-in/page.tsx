import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SignInForm } from "@/app/[locale]/auth/sign-in/_components/sign-in-form";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import type { Locale } from "@/config/i18n.config";

interface SignInPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: SignInPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "SignInPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function SignInPage(props: SignInPageProps): ReactNode {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = useTranslations("SignInPage");

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("title")}</PageTitle>
			<SignInForm />
		</MainContent>
	);
}
