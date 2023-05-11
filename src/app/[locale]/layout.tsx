import "tailwindcss/tailwind.css";
import "@/styles/index.css";

import { type Metadata, type ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getTranslator } from "next-intl/server";
import { type ReactNode } from "react";
import { jsonLdScriptProps } from "react-schemaorg";

import { Providers } from "@/app/[locale]/providers";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { id } from "@/components/main-content";
import { SkipLink } from "@/components/skip-link";
import { Analytics } from "@/lib/analytics";
import * as fonts from "@/lib/fonts";
import { env } from "~/config/env.config";
import { type Locale } from "~/config/i18n.config";
// import { locales } from "~/config/i18n.config";

interface Props {
	children: ReactNode;
	params: {
		locale: Locale;
	};
}

/**
 * FIXME: `next-intl` currently only supports SSR, no static generation.
 */
// export function generateStaticParams(): Array<Props["params"]> {
// 	return locales.map((locale) => {
// 		return { locale };
// 	});
// }

export async function generateMetadata(
	props: Props,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { locale } = props.params;
	const t = await getTranslator(locale, "LocaleLayout");

	const metadata: Metadata = {
		title: {
			default: t("meta.title"),
			template: ["%s", t("meta.title")].join(" | "),
		},
		description: t("meta.description"),
		colorScheme: "light dark",
		metadataBase: new URL(env.NEXT_PUBLIC_APP_BASE_URL),
		alternates: {
			canonical: "./",
		},
		openGraph: {
			title: t("meta.title"),
			description: t("meta.description"),
			url: "./",
			siteName: t("meta.title"),
			locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			site: t("meta.twitter.site"),
		},
		verification: {
			// google: "",
		},
	};

	return metadata;
}

export default function LocaleLayout(props: Props): ReactNode {
	const { children, params } = props;

	const locale = useLocale() as Locale;
	const t = useTranslations("LocaleLayout");

	if (params.locale !== locale) {
		notFound();
	}

	return (
		<html className={fonts.sans.variable} lang={locale}>
			<body>
				{/* @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld */}
				<script
					{...jsonLdScriptProps({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: t("meta.title"),
						description: t("meta.description"),
					})}
				/>

				<Analytics baseUrl={env.NEXT_PUBLIC_MATOMO_BASE_URL} id={env.NEXT_PUBLIC_MATOMO_ID} />

				<SkipLink targetId={id}>{t("skip-to-main-content")}</SkipLink>

				<Providers>
					<div className="relative grid min-h-full grid-rows-[auto_1fr_auto]">
						<AppHeader />
						{children}
						<AppFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}
