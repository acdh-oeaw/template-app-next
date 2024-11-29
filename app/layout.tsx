import "@/styles/index.css";

// import { pick } from "@acdh-oeaw/lib";
import { cn } from "@acdh-oeaw/style-variants";
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";
import { LocalizedStringProvider as Translations } from "react-aria-components/i18n";
import { jsonLdScriptProps } from "react-schemaorg";

import { AppFooter } from "@/app/_components/app-footer";
import { AppHeader } from "@/app/_components/app-header";
import { AppLayout } from "@/app/_components/app-layout";
import { Providers } from "@/app/_components/providers";
import { TailwindIndicator } from "@/app/_components/tailwind-indicator";
import { ServerToast } from "@/components/server-toast";
import { id } from "@/components/ui/main-content";
import { SkipLink } from "@/components/ui/skip-link";
import { ToastRegion } from "@/components/ui/toast-region";
import { env } from "@/config/env.config";
import { AnalyticsScript } from "@/lib/analytics-script";
import { ColorSchemeScript } from "@/lib/color-scheme-script";
import * as fonts from "@/lib/fonts";
import { getMetadata } from "@/lib/i18n/metadata";

interface LocaleLayoutProps {
	children: ReactNode;
}

export const viewport: Viewport = {
	colorScheme: "light dark",
	initialScale: 1,
	width: "device-width",
};

export async function generateMetadata(
	_props: Omit<Readonly<LocaleLayoutProps>, "children">,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const locale = await getLocale();
	const meta = await getMetadata();

	const metadata: Metadata = {
		metadataBase: new URL(env.NEXT_PUBLIC_APP_BASE_URL),
		alternates: {
			canonical: "./",
		},
		title: {
			default: meta.title,
			template: ["%s", meta.title].join(" | "),
		},
		description: meta.description,
		openGraph: {
			title: meta.title,
			description: meta.description,
			url: "./",
			siteName: meta.title,
			locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			creator: meta.social.twitter,
			site: meta.social.twitter,
		},
		verification: {
			google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
		},
	};

	return metadata;
}

export default async function LocaleLayout(props: Readonly<LocaleLayoutProps>): Promise<ReactNode> {
	const { children } = props;

	const locale = await getLocale();
	const t = await getTranslations("LocaleLayout");
	const meta = await getMetadata();
	const messages = await getMessages();
	/**
	 * TODO: Passing all messages to the client is fine for most apps. For larger apps, it can
	 * make sense to only pass messages for the error page globally, and pass other required
	 * messages via components props, or via a page-level or layout-level `NextIntlClientProvider`.
	 *
	 * @see https://next-intl.dev/docs/environments/server-client-components#using-internationalization-in-client-components
	 */
	// const clientMessages = pick(messages, ["Error"]);
	const clientMessages = messages;

	return (
		<html
			className={cn(
				fonts.body.variable,
				fonts.heading.variable,
				fonts.mono.variable,
				"bg-background-base text-text-strong antialiased",
			)}
			lang={locale}
			/**
			 * Suppressing hydration warning because we add `data-ui-color-scheme` before first paint.
			 */
			suppressHydrationWarning={true}
		>
			<body>
				{/* @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld */}
				<script
					{...jsonLdScriptProps({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: meta.title,
						description: meta.description,
					})}
				/>

				<ColorSchemeScript />

				{/**
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#optimizing-bundle-size
				 *
				 * TODO: only include translations for components actually used
				 *
				 * @see https://react-spectrum.adobe.com/react-aria/ssr.html#advanced-optimization
				 */}
				<Translations locale={locale} />

				<Providers locale={locale} messages={clientMessages}>
					<AnalyticsScript
						baseUrl={env.NEXT_PUBLIC_MATOMO_BASE_URL}
						id={env.NEXT_PUBLIC_MATOMO_ID}
					/>

					<ToastRegion />
					<Suspense>
						<ServerToast />
					</Suspense>

					<SkipLink targetId={id}>{t("skip-to-main-content")}</SkipLink>

					<AppLayout>
						<AppHeader />
						{children}
						<AppFooter />
					</AppLayout>
				</Providers>

				<TailwindIndicator />
			</body>
		</html>
	);
}
