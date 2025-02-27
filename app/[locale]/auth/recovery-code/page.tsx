import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { MainContent } from "@/components/main-content";
import { urls } from "@/config/auth.config";
import type { Locale } from "@/config/i18n.config";
import { redirect } from "@/lib/i18n/navigation";
import { getCurrentSession } from "@/lib/server/auth/sessions";
import { getUserRecoverCode } from "@/lib/server/auth/users";
import { globalGetRateLimit } from "@/lib/server/rate-limit/global-rate-limit";

interface RecoveryCodePageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export async function generateMetadata(
	props: Readonly<RecoveryCodePageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "RecoveryCodePage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function RecoveryCodePage(
	props: Readonly<RecoveryCodePageProps>,
): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("RecoveryCodePage");
	const e = await getTranslations("errors");

	if (!(await globalGetRateLimit())) {
		return e("too-many-requests");
	}

	const { session, user } = await getCurrentSession();

	if (session == null) {
		redirect({ href: urls.signIn, locale });
	}
	if (!user.emailVerified) {
		redirect({ href: urls.verifyEmail, locale });
	}
	if (!user.registered2FA) {
		redirect({ href: urls["2faSetup"], locale });
	}
	if (!session.twoFactorVerified) {
		redirect({ href: urls["2fa"], locale });
	}

	const recoveryCode = await getUserRecoverCode(user.id);

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					{/* <p className="font-heading text-small text-text-weak xs:text-heading-4">{t("message")}</p> */}
				</div>
			</section>

			<section className="layout-subgrid content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<div className="max-w-text grid gap-y-8">
					<p>
						{t("your-code")} {recoveryCode}
					</p>

					<p>{t("message")}</p>

					<div className="flex flex-wrap items-center gap-x-6">
						<Link
							className="focus-visible:focus-outline inline-flex items-center gap-x-2 rounded-0.5 text-small text-text-brand underline hover:no-underline"
							href={urls.afterSignIn}
						>
							{t("next")}
						</Link>
					</div>
				</div>
			</section>
		</MainContent>
	);
}
