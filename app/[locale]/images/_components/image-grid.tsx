import { createUrl, request } from "@acdh-oeaw/lib";
import type { ReactNode } from "react";

import { env } from "@/config/env.config";

export async function ImageGrid(): Promise<ReactNode> {
	const url = createUrl({ baseUrl: env.NEXT_PUBLIC_APP_BASE_URL, pathname: "/api/images/list" });
	const images = (await request(url, { responseType: "json" })) as {
		items: Array<{ objectName: string; url: string }>;
	};

	return (
		<ul role="list">
			{images.items.map((image) => {
				return (
					<li key={image.objectName}>
						<pre>{JSON.stringify(image, null, 2)}</pre>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img alt="" src={image.url} />
					</li>
				);
			})}
		</ul>
	);
}
