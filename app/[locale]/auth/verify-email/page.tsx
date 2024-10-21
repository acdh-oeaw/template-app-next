import type { Metadata, ResolvingMetadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, unstable_setRequestLocale as setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { EmailVerificationForm } from "@/app/[locale]/auth/verify-email/_components/email-verification-form";
import { ResendEmailVerificationCodeForm } from "@/app/[locale]/auth/verify-email/_components/resend-email-verification-code-form";
import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { getCurrentSession } from "@/lib/auth";
import { isVerified } from "@/lib/auth/is-verified";
import { redirect } from "@/lib/navigation";

interface VerifyEmailPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: VerifyEmailPageProps,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "VerifyEmailPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function VerifyEmailPage(props: VerifyEmailPageProps): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("VerifyEmailPage");

	const { user } = await getCurrentSession();

	if (user == null) {
		redirect(urls.signIn);
	}

	/**
	 * TODO: Ideally we'd sent a new verification email automatically if the previous one is expired,
	 * but we can't set cookies inside server components.
	 */
	const verificationRequest = getUserEmailVerificationRequestFromRequest();

	if (verificationRequest == null && isVerified(user.emailVerified)) {
		redirect(urls.afterSignIn);
	}

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("title")}</PageTitle>

			<p>We sent an 8-digit code to {verificationRequest?.email ?? user.email}.</p>
			<p>{t("message")}</p>

			<EmailVerificationForm />

			<ResendEmailVerificationCodeForm />

			{/* <Link href={createHref({ pathname: "/settings" })}>{t("change-email")}</Link> */}
		</MainContent>
	);
}
