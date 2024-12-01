import { useObjectUrl, type UseObjectUrlParams } from "@acdh-oeaw/keystatic-lib/preview";
import { cn, styles } from "@acdh-oeaw/style-variants";
import { NotEditable, type ParsedValueForComponentSchema } from "@keystatic/core";
import type { ReactNode } from "react";

import type {
	CalloutKind,
	FigureAlignment,
	GridAlignment,
	GridLayout,
	VideoProvider,
} from "@/lib/keystatic/component-options";
import type { createLinkSchema } from "@/lib/keystatic/create-link-schema";
import { createVideoUrl } from "@/lib/keystatic/create-video-url";

type LinkSchema = ParsedValueForComponentSchema<ReturnType<typeof createLinkSchema>>;

const calloutStyles = styles({
	base: "my-4 rounded-1 p-4 text-tiny leading-relaxed",
	variants: {
		kind: {
			caution: "",
			important: "",
			note: "",
			tip: "",
			warning: "",
		},
	},
	defaults: {
		kind: "note",
	},
});

interface CalloutPreviewProps {
	children: ReactNode;
	/** @default "note" */
	kind?: CalloutKind;
	title?: string;
}

export function CalloutPreview(props: Readonly<CalloutPreviewProps>): ReactNode {
	const { children, kind = "note", title } = props;

	return (
		<aside className={calloutStyles({ kind })}>
			<NotEditable>{title ? <strong>{title}</strong> : null}</NotEditable>
			{children}
		</aside>
	);
}

interface DisclosurePreviewProps {
	children: ReactNode;
	title: string;
}

export function DisclosurePreview(props: Readonly<DisclosurePreviewProps>): ReactNode {
	const { children, title } = props;

	return (
		<details>
			<NotEditable>
				<summary>{title}</summary>
			</NotEditable>
			{children}
		</details>
	);
}

interface EmbedPreviewProps {
	children?: ReactNode;
	src: string | null;
}

export function EmbedPreview(props: Readonly<EmbedPreviewProps>): ReactNode {
	const { children, src } = props;

	if (src == null) return null;

	return (
		<figure className="grid gap-y-2">
			<NotEditable>
				{/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
				<iframe
					allowFullScreen={true}
					className="aspect-video w-full overflow-hidden rounded-1"
					src={src}
				/>
			</NotEditable>
			<figcaption>{children}</figcaption>
		</figure>
	);
}

interface FigurePreviewProps {
	/** @default "stretch" */
	alignment?: FigureAlignment;
	alt?: string;
	children?: ReactNode;
	src: UseObjectUrlParams | null;
}

export function FigurePreview(props: Readonly<FigurePreviewProps>): ReactNode {
	const { alignment = "stretch", alt = "", children, src } = props;

	const url = useObjectUrl(src);

	if (url == null) return null;

	return (
		<figure className={cn("grid gap-y-2", alignment === "center" ? "justify-center" : undefined)}>
			<NotEditable>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img alt={alt} className="overflow-hidden rounded-1" src={url} />
			</NotEditable>
			<figcaption>{children}</figcaption>
		</figure>
	);
}

const gridStyles = styles({
	base: "grid content-start gap-x-8",
	variants: {
		alignment: {
			center: "items-center",
			stretch: "",
		},
		layout: {
			"two-columns": "sm:grid-cols-2",
			"three-columns": "sm:grid-cols-3",
			"four-columns": "sm:grid-cols-4",
			"one-two-columns": "sm:grid-cols-[1fr_2fr]",
			"one-three-columns": "sm:grid-cols-[1fr_3fr]",
			"one-four-columns": "sm:grid-cols-[1fr_4fr]",
		},
	},
	defaults: {
		alignment: "stretch",
		layout: "two-columns",
	},
});

interface GridPreviewProps {
	/** @default "stretch" */
	alignment?: GridAlignment;
	children: ReactNode;
	/** @default "two-columns" */
	layout: GridLayout;
}

export function GridPreview(props: Readonly<GridPreviewProps>): ReactNode {
	const { alignment = "stretch", children, layout = "two-columns" } = props;

	return <div className={gridStyles({ alignment, layout })}>{children}</div>;
}

interface GridItemPreviewProps {
	/** @default "stretch" */
	alignment?: GridAlignment;
	children: ReactNode;
}

export function GridItemPreview(props: Readonly<GridItemPreviewProps>): ReactNode {
	const { alignment = "stretch", children } = props;

	return <div className={alignment === "center" ? "self-center" : undefined}>{children}</div>;
}

interface HeadingIdPreviewProps {
	children: ReactNode;
}

export function HeadingIdPreview(props: Readonly<HeadingIdPreviewProps>): ReactNode {
	const { children } = props;

	return (
		<NotEditable>
			<span className="opacity-50">#{children}</span>
		</NotEditable>
	);
}

interface LinkButtonPreviewProps {
	children: ReactNode;
	link: LinkSchema;
}

export function LinkButtonPreview(props: Readonly<LinkButtonPreviewProps>): ReactNode {
	const { children, link: _link } = props;

	if (children == null || children === "") return null;

	return <div className="inline-flex min-h-12 rounded-1 px-4 py-2 font-strong">{children}</div>;
}

interface TableOfContentsPreviewProps {
	title?: string;
}

export function TableOfContentsPreview(props: Readonly<TableOfContentsPreviewProps>): ReactNode {
	const { title = "Table of contents" } = props;

	return (
		<div>
			<strong>{title}</strong>
			<div>Will be generated at build time.</div>
		</div>
	);
}

interface TabsPreviewProps {
	children: ReactNode;
}

export function TabsPreview(props: Readonly<TabsPreviewProps>): ReactNode {
	const { children } = props;

	return <div>{children}</div>;
}

interface TabPreviewProps {
	children: ReactNode;
	title: string;
}

export function TabPreview(props: Readonly<TabPreviewProps>): ReactNode {
	const { children, title } = props;

	return (
		<div>
			<NotEditable>{title}</NotEditable>
			{children}
		</div>
	);
}

interface VideoPreviewProps {
	children?: ReactNode;
	id: string;
	provider: VideoProvider;
	startTime?: number | null;
}

export function VideoPreview(props: Readonly<VideoPreviewProps>): ReactNode {
	const { children, id, provider, startTime } = props;

	const href = String(createVideoUrl(provider, id, startTime));

	return (
		<figure className="grid gap-y-2">
			<NotEditable>
				{/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
				<iframe
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen={true}
					className="aspect-video w-full overflow-hidden rounded-1"
					referrerPolicy="strict-origin-when-cross-origin"
					src={href}
				/>
			</NotEditable>
			<figcaption>{children}</figcaption>
		</figure>
	);
}
