import type { ReactNode } from "react";

interface EmbedProps {
	children: ReactNode;
	src: string;
	/** Added by `with-iframe-titles` mdx plugin. */
	title?: string;
}

export function Embed(props: Readonly<EmbedProps>): ReactNode {
	const { children, src, title } = props;

	return (
		<figure>
			<iframe
				allowFullScreen={true}
				className="aspect-video w-full overflow-hidden rounded-2"
				referrerPolicy="strict-origin-when-cross-origin"
				src={src}
				title={title}
			/>
			<figcaption>{children}</figcaption>
		</figure>
	);
}
