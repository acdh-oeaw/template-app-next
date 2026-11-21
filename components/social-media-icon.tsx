import type { StaticImageData } from "next/image";
import type { CSSProperties, ReactNode } from "react";

import globe from "#/assets/images/icons/globe.svg";
import mail from "#/assets/images/icons/mail.svg";
import bluesky from "#/assets/images/logos/bluesky.svg";
import facebook from "#/assets/images/logos/facebook.svg";
import flickr from "#/assets/images/logos/flickr.svg";
import github from "#/assets/images/logos/github.svg";
import instagram from "#/assets/images/logos/instagram.svg";
import linkedin from "#/assets/images/logos/linkedin.svg";
import mastodon from "#/assets/images/logos/mastodon.svg";
import orcid from "#/assets/images/logos/orcid.svg";
import rss from "#/assets/images/logos/rss.svg";
import x from "#/assets/images/logos/x.svg";
import youtube from "#/assets/images/logos/youtube.svg";
import type { SocialMediaKind } from "#/lib/metadata/site-metadata.ts";

const icons: Record<SocialMediaKind, StaticImageData> = {
	bluesky,
	email: mail,
	facebook,
	flickr,
	github,
	instagram,
	linkedin,
	mastodon,
	orcid,
	rss,
	twitter: x,
	website: globe,
	youtube,
};

interface SocialMediaIconProps {
	kind: SocialMediaKind;
}

/**
 * Decorative, the link needs its own accessible name. The svg is a mask over `currentColor`, so it matches the text
 * color, which an `<img>` cannot. `forced-color-adjust-none` keeps forced colors mode from replacing the background,
 * while `currentColor` still resolves to the forced text color.
 */
export function SocialMediaIcon(props: Readonly<SocialMediaIconProps>): ReactNode {
	const { kind } = props;

	const style = { "--icon": `url(${icons[kind].src})` } as CSSProperties;

	return (
		<span
			aria-hidden={true}
			className="block size-6 bg-current mask-(--icon) mask-contain mask-center mask-no-repeat forced-color-adjust-none"
			style={style}
		/>
	);
}
