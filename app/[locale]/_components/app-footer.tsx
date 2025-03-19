import { useTranslations } from "next-intl";
import type { FC, ReactNode } from "react";

import { Logo } from "@/components/logo";
import { NavLink, type NavLinkProps } from "@/components/nav-link";
import {
	BlueskyIcon,
	MastodonIcon,
	TwitterIcon,
	YouTubeIcon,
} from "@/components/social-media-icons";
import { useMetadata } from "@/lib/i18n/metadata";
import { createHref } from "@/lib/navigation/create-href";

export function AppFooter(): ReactNode {
	const t = useTranslations("AppFooter");
	const meta = useMetadata();

	const links = {
		contact: {
			href: createHref({ pathname: "/contact" }),
			label: t("links.contact"),
		},
		imprint: {
			href: createHref({ pathname: "/imprint" }),
			label: t("links.imprint"),
		},
	} satisfies Record<string, { href: NavLinkProps["href"]; label: string }>;

	const socialMedia = {
		bluesky: {
			href: meta.social.bluesky,
			label: t("social-media.bluesky"),
			icon: BlueskyIcon,
		},
		mastodon: {
			href: meta.social.mastodon,
			label: t("social-media.mastodon"),
			icon: MastodonIcon,
		},
		twitter: {
			href: meta.social.twitter,
			label: t("social-media.twitter"),
			icon: TwitterIcon,
		},
		youtube: {
			href: meta.social.youtube,
			label: t("social-media.youtube"),
			icon: YouTubeIcon,
		},
	} satisfies Record<string, { href: string; label: string; icon: FC }>;

	return (
		<footer className="layout-grid grid gap-y-6 border-t border-stroke-weak py-12">
			<div className="grid gap-y-8 xs:flex xs:items-center xs:justify-between">
				<Logo className="h-8 w-auto shrink-0" />

				<nav aria-label="navigation-social-media">
					<ul className="flex flex-wrap items-center gap-x-6" role="list">
						{Object.entries(socialMedia).map(([id, link]) => {
							const Icon = link.icon;

							return (
								<li key={id} className="shrink-0">
									<NavLink
										className="inline-block rounded-0.5 focus-visible:focus-outline"
										href={link.href}
									>
										<Icon className="size-6 text-icon-neutral transition hover:text-icon-brand" />
										<span className="sr-only">{link.label}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			<div className="grid gap-y-8">
				<nav aria-label={t("navigation-secondary")}>
					<ul className="flex items-center gap-x-6 text-small text-text-weak" role="list">
						{Object.entries(links).map(([id, link]) => {
							return (
								<li key={id}>
									<NavLink
										className="rounded-0.5 hover:underline focus-visible:focus-outline"
										href={link.href}
									>
										{link.label}
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				<small className="text-tiny text-text-weak">
					&copy; {new Date().getUTCFullYear()}{" "}
					<a
						className="rounded-0.5 hover:underline focus-visible:focus-outline"
						href={meta.social.website}
					>
						{t("creator")}
					</a>
				</small>
			</div>
		</footer>
	);
}
