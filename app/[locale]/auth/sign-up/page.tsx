import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SignUpForm } from "@/app/[locale]/auth/sign-up/_components/sign-up-form";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import type { Locale } from "@/config/i18n.config";

interface SignUpPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: SignUpPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "SignUpPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default function SignUpPage(props: SignUpPageProps): ReactNode {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = useTranslations("SignUpPage");

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("title")}</PageTitle>
			<SignUpForm />
		</MainContent>
	);
}
