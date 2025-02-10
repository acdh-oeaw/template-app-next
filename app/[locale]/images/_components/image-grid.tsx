import type { ReactNode } from "react";

import { createClient } from "@/lib/server/images/create-client";

export async function ImageGrid(): Promise<ReactNode> {
	const client = await createClient();
	const { images } = await client.images.all();

	return (
		<ul className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-8" role="list">
			{images.map((image) => {
				const { objectName } = image;

				const { url } = client.signedImageUrls.get(objectName);

				return (
					<li key={image.objectName}>
						<figure className="grid grid-rows-[12rem_auto] gap-y-2">
							{/* FIXME: add a custom loader for `next/image` if possible, otherwise create our own wrapper which generates a `srcset`. */}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								alt=""
								className="size-full rounded-2 border border-stroke-weak object-cover"
								src={url}
							/>
							<figcaption className="text-tiny text-text-weak">{objectName}</figcaption>
						</figure>
					</li>
				);
			})}
		</ul>
	);
}
