import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { NavLink } from "#/components/nav-link.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";
import { getSiteMetadata, type SocialMediaKind } from "#/lib/metadata/site-metadata.ts";

interface AppFooterProps {
	locale: Locale;
}

export async function AppFooter(props: Readonly<AppFooterProps>): Promise<ReactNode> {
	const { locale } = props;

	const t = await getTranslations();
	const meta = await getSiteMetadata(locale);

	const labels: Record<SocialMediaKind, string> = {
		bluesky: "Bluesky",
		email: t("Email"),
		facebook: "Facebook",
		flickr: "Flickr",
		github: "GitHub",
		instagram: "Instagram",
		linkedin: "LinkedIn",
		mastodon: "Mastodon",
		orcid: "ORCID",
		rss: "RSS",
		twitter: "Twitter",
		website: t("Website"),
		youtube: "YouTube",
	};

	return (
		<footer className="flex flex-wrap items-center justify-between gap-4 p-4">
			<nav aria-label={t("Legal")}>
				<ul className="flex gap-4">
					<li>
						<NavLink className="aria-[current]:font-bold" href="/imprint">
							{t("Imprint")}
						</NavLink>
					</li>
				</ul>
			</nav>
			<nav aria-label={t("Social media")}>
				<ul className="flex flex-wrap gap-4">
					{meta.social.map((link) => {
						return (
							<li key={link.kind}>
								<a href={link.href} rel={link.kind === "mastodon" ? "me noreferrer" : "noreferrer"}>
									{labels[link.kind]}
								</a>
							</li>
						);
					})}
				</ul>
			</nav>
		</footer>
	);
}
