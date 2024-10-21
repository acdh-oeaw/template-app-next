import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { SignUpForm } from "@/app/[locale]/auth/sign-up/_components/sign-up-form";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { getCurrentSession } from "@/lib/auth";
import { isVerified } from "@/lib/auth/is-verified";
import { redirect } from "@/lib/navigation";

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

export default async function SignUpPage(props: SignUpPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("SignUpPage");

	const { session, user } = await getCurrentSession();

	if (session != null) {
		if (!isVerified(user.emailVerified)) {
			redirect(urls.verifyEmail);
		}

		// if (!user.registered2FA) {
		// 	redirect(urls.2faSetup);
		// }

		// if (!session.twoFactorVerified) {
		// 	redirect(urls.2fa);
		// }

		redirect(urls.afterSignIn);
	}

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("title")}</PageTitle>
			<SignUpForm />
		</MainContent>
	);
}
