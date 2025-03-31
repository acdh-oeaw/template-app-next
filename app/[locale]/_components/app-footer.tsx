import { useTranslations } from "next-intl";
import type { FC, ReactNode } from "react";

import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import {
	BlueskyIcon,
	MastodonIcon,
	TwitterIcon,
	YouTubeIcon,
} from "@/components/social-media-icons";
import { TouchTarget } from "@/components/ui/touch-target";
import { useMetadata } from "@/lib/i18n/metadata";
import { createHref } from "@/lib/navigation/create-href";
import type { NavigationLink } from "@/lib/navigation/navigation";

export function AppFooter(): ReactNode {
	const t = useTranslations("AppFooter");
	const meta = useMetadata();

	const links = {
		contact: {
			type: "link",
			href: createHref({ pathname: "/contact" }),
			label: t("navigation.items.contact"),
		},
		imprint: {
			type: "link",
			href: createHref({ pathname: "/imprint" }),
			label: t("navigation.items.imprint"),
		},
	} satisfies Record<string, NavigationLink>;

	const socialMedia = {
		bluesky: {
			type: "link",
			href: meta.social.bluesky,
			label: t("navigation-social-media.items.bluesky"),
			icon: BlueskyIcon,
		},
		mastodon: {
			type: "link",
			href: meta.social.mastodon,
			label: t("navigation-social-media.items.mastodon"),
			icon: MastodonIcon,
		},
		twitter: {
			type: "link",
			href: meta.social.twitter,
			label: t("navigation-social-media.items.twitter"),
			icon: TwitterIcon,
		},
		youtube: {
			type: "link",
			href: meta.social.youtube,
			label: t("navigation-social-media.items.youtube"),
			icon: YouTubeIcon,
		},
	} satisfies Record<string, NavigationLink & { icon: FC }>;

	return (
		<footer className="layout-grid grid gap-y-6 border-t border-stroke-weak py-12">
			<div className="grid gap-y-8 xs:flex xs:items-center xs:justify-between">
				<Logo className="h-8 w-auto shrink-0" />

				<nav aria-label={t("navigation-social-media.label")}>
					<ul className="flex flex-wrap items-center gap-x-6 gap-y-3" role="list">
						{Object.entries(socialMedia).map(([id, link]) => {
							const Icon = link.icon;

							return (
								<li key={id} className="shrink-0">
									<NavLink
										className="relative inline-block rounded-0.5 focus-visible:focus-outline"
										href={link.href}
									>
										<TouchTarget />
										<Icon
											className="size-6 text-icon-neutral transition hover:text-icon-brand"
											data-slot="icon"
										/>
										<span className="sr-only">{link.label}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			<div className="grid gap-y-8">
				<nav aria-label={t("navigation.label")}>
					<ul
						className="flex flex-wrap items-center gap-x-6 gap-y-3 text-small text-text-weak"
						role="list"
					>
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
