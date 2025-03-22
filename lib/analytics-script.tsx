"use client";

import { addTrailingSlash, createUrl } from "@acdh-oeaw/lib";
import type { NextWebVitalsMetric } from "next/app";
import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";
import { useLocale } from "next-intl";
import { Fragment, type ReactNode, Suspense, useEffect } from "react";

import { env } from "@/config/env.config";
import type { IntlLocale } from "@/lib/i18n/locales";
import { usePathname, useSearchParams } from "@/lib/navigation/navigation";

declare global {
	interface Window {
		_paq?: Array<unknown>;
	}
}

interface AnalyticsProps {
	baseUrl: string | undefined;
	id: number | undefined;
}

export function AnalyticsScript(props: AnalyticsProps): ReactNode {
	const { baseUrl, id } = props;

	if (baseUrl == null || id == null) return null;

	return (
		<Fragment>
			<Script
				dangerouslySetInnerHTML={{
					__html: `const e=window._paq=window._paq??[];e.push(["disableCookies"]),e.push(["enableHeartBeatTimer"]);const s="${addTrailingSlash(baseUrl)}";e.push(["setTrackerUrl",s+"matomo.php"]),e.push(["setSiteId",${String(id)}]);const t=document,a=t.createElement("script"),o=t.getElementsByTagName("script")[0];a.async=!0,a.src=s+"matomo.js",o?.parentNode?.insertBefore(a,o);`,
				}}
				id="analytics-script"
			/>
			<Suspense>
				<PageViewTracker />
			</Suspense>
		</Fragment>
	);
}

function PageViewTracker(): ReactNode {
	const locale = useLocale();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		const url = createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname, searchParams });
		trackPageView(locale, url);
	}, [locale, pathname, searchParams]);

	useReportWebVitals(reportWebVitals);

	return null;
}

/**
 * Track urls without locale prefix, and separate custom event for locale.
 */
function trackPageView(locale: IntlLocale, url: URL): void {
	/** @see https://developer.matomo.org/guides/tracking-javascript-guide#custom-variables */
	window._paq?.push(["setCustomVariable", 1, "Locale", locale, "page"]);
	window._paq?.push(["setCustomUrl", url]);
	window._paq?.push(["trackPageView"]);
	window._paq?.push(["enableLinkTracking"]);
}

function reportWebVitals(metric: NextWebVitalsMetric): void {
	window._paq?.push([
		"trackEvent",
		"Analytics",
		`Web Vitals ${metric.id}`,
		metric.name,
		Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
	]);
}
