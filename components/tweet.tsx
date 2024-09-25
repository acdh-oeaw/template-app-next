import type { ReactNode } from "react";
import { Tweet as StaticTweet } from "react-tweet";

interface TweetProps {
	children: ReactNode;
	id: string;
}

export function Tweet(props: TweetProps): ReactNode {
	const { children, id } = props;

	return (
		<figure>
			<StaticTweet id={id} />
			<figcaption>{children}</figcaption>
		</figure>
	);
}
