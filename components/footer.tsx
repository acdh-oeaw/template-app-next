import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ColorSchemeSwitcher } from "#/components/color-scheme/color-scheme-switcher.tsx";
import { Link } from "#/components/link.tsx";
import { SocialMediaIcon } from "#/components/social-media-icon.tsx";
import type { Locale } from "#/lib/i18n/locales.ts";
import { getSiteMetadata, type SocialMediaKind } from "#/lib/metadata/site-metadata.ts";
import { externalHref, href } from "#/lib/navigation/href.ts";

interface FooterProps {
	locale: Locale;
}

export async function Footer(props: Readonly<FooterProps>): Promise<ReactNode> {
	const { locale } = props;

	const t = await getTranslations({ locale });
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
		rss: t("RSS feed"),
		twitter: "X",
		website: t("Website"),
		youtube: "YouTube",
	};

	return (
		<footer className="flex flex-wrap items-center justify-between gap-4 p-4">
			<ul className="flex flex-wrap gap-4">
				<li>
					<Link href={href({ pathname: "/imprint" })}>{t("Imprint")}</Link>
				</li>
				<li>
					<Link href={href({ pathname: "/accessibility" })}>{t("Accessibility statement")}</Link>
				</li>
			</ul>
			{meta.social.length > 0 ? (
				<ul aria-label={t("Social media")} className="flex flex-wrap gap-2">
					{meta.social.map((link) => (
						<li key={link.href}>
							<Link className="block p-2" href={externalHref(link.href)}>
								<SocialMediaIcon kind={link.kind} />
								<span className="sr-only">{labels[link.kind]}</span>
							</Link>
						</li>
					))}
				</ul>
			) : null}
			<ColorSchemeSwitcher />
		</footer>
	);
}
