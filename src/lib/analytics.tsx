"use client";

import Script from "next/script";
import { usePathname } from "next-intl/client";
import { type ReactNode, useEffect } from "react";

declare global {
	interface Window {
		_paq?: Array<unknown>;
	}
}

function trackPageView(url: string): void {
	window._paq?.push(["setCustomUrl", url]);
	window._paq?.push(["trackPageView"]);
	window._paq?.push(["enableLinkTracking"]);
}

function createAnalyticsScript(baseUrl: string, id: string): string {
	return `
  var _paq = (window._paq = window._paq || [])
  _paq.push(['disableCookies'])
  _paq.push(['enableHeartBeatTimer'])
  ;(function () {
    var u = '${baseUrl}'
    _paq.push(['setTrackerUrl', u + 'matomo.php'])
    _paq.push(['setSiteId', '${id}'])
    var d = document,
      g = d.createElement('script'),
      s = d.getElementsByTagName('script')[0]
    g.async = true
    g.src = u + 'matomo.js'
    s.parentNode.insertBefore(g, s)
  })()`;
}

interface AnalyticsProps {
	baseUrl: string | undefined;
	id: string | undefined;
}

export function Analytics(props: AnalyticsProps): ReactNode {
	const { baseUrl, id } = props;

	const pathname = usePathname();

	useEffect(() => {
		trackPageView(pathname);
	}, [pathname]);

	if (baseUrl == null || id == null) return null;

	return (
		<Script
			dangerouslySetInnerHTML={{ __html: createAnalyticsScript(baseUrl, id) }}
			id="analytics"
		/>
	);
}
