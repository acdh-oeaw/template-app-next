import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { MainContent } from "@/components/main-content";
import { env } from "@/config/env.config";
import type { Locale } from "@/config/i18n.config";
import { client } from "@/tina/__generated__/client";

interface PostPageProps {
	params: {
		locale: Locale;
		segments: Array<string>;
	};
}

export const dynamicParams = false;

export async function generateStaticParams(props: {
	params: Pick<PostPageProps["params"], "locale">;
}): Promise<Awaited<Array<Pick<PostPageProps["params"], "segments">>>> {
	const { params } = props;

	const { locale } = params;

	const paths: Array<{ segments: Array<string> }> = [];
	const connection = await client.queries.postConnection();
	connection.data.postConnection.edges?.forEach((edge) => {
		if (edge?.node) {
			const segments = edge.node._sys.breadcrumbs;
			paths.push({
				segments:
					/** @see https://github.com/vercel/next.js/issues/63002 */
					env.NODE_ENV === "production" ? segments : segments.map(encodeURIComponent),
			});
		}
	});

	return paths;
}

export async function generateMetadata(
	props: Readonly<PostPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;
	const segments = params.segments.map(decodeURIComponent);

	const filePath = `${segments.join("/")}.md`;
	const result = await client.queries.post({ relativePath: filePath });

	const metadata: Metadata = {
		title: result.data.post.title,
	};

	return metadata;
}

export default async function PostPage(props: Readonly<PostPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;
	const segments = params.segments.map(decodeURIComponent);

	setRequestLocale(locale);

	const filePath = `${segments.join("/")}.md`;
	const result = await client.queries.post({ relativePath: filePath });

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-24">
				<h1>{result.data.post.title}</h1>
			</section>
		</MainContent>
	);
}
