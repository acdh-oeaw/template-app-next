import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import type { Locale } from "@/config/i18n.config";

interface MetadataImageProps {
	locale: Locale;
	size: { width: number; height: number };
	title: string;
}

export async function MetadataImage(props: Readonly<MetadataImageProps>): Promise<ImageResponse> {
	const { locale, size, title } = props;

	/**
	 * FIXME: Variable fonts are currently not supported by `satori`.
	 *
	 * @see https://github.com/vercel/satori/issues/162
	 */
	const fontPath = join(process.cwd(), "public", "assets", "fonts", "inter-semibold.ttf");
	const font = await readFile(fontPath);

	/** @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#using-nodejs-runtime-with-local-assets */
	// const imagePath = join(process.cwd(), image);
	// const imageData = await readFile(featuredImagePath);
	// const imageSrc = Uint8Array.from(featuredImageData).buffer;

	return new ImageResponse(
		(
			<div
				lang={locale}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 32,
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
					height: "100%",
					padding: 16,
					backgroundColor: "#fff",
				}}
			>
				<svg viewBox="311.787 344.453 90.517 100" width={200}>
					<path
						d="M380.869 396.745c-11.524 0-16.373 7.996-16.475 8.168a.152.152 0 0 0-.009.011v-22.142l.006.005a23.994 23.994 0 0 0 5.804 5.38l.151.097c.287.184.574.362.866.534.109.063.219.128.334.191.208.12.425.236.642.349.159.085.318.167.479.248.136.065.269.133.404.196a21.485 21.485 0 0 0 1.088.479c.237.099.475.194.718.283l.331.121c.245.087.49.171.735.249l.287.093c.292.088.584.171.877.247a24.68 24.68 0 0 0 1.207.288c.098.021.196.038.298.058.245.048.493.091.738.131.13.021.256.043.381.062.263.036.526.07.79.1.146.015.29.033.436.044.267.026.537.044.804.063.183.01.365.016.548.022.128.006.256.009.386.011.156.003.309.007.465.007 6.536 0 12.452-2.649 16.746-6.921l-3.325-3.324a19.002 19.002 0 0 1-9.589 5.148c-.186.037-.373.066-.559.099-.117.021-.237.045-.356.064-.95.146-1.926.225-2.917.225-9.508 0-17.362-6.985-18.773-16.097v-5.848c1.411-9.114 9.266-16.096 18.773-16.096a18.978 18.978 0 0 1 13.471 5.59l3.328-3.327a23.664 23.664 0 0 0-13.753-6.771 23.642 23.642 0 0 0-17.211 4.513l-.013.011a23.693 23.693 0 0 0-2.653 2.315c-.235.233-.462.471-.684.715l-.078.09c-.217.237-.426.48-.629.725-.028.034-.061.068-.086.102-.156.192-.311.389-.459.585v-.009c-.006.003-.006.004-.008.007v-9.379h-5.084v99.999h4.961v-26.152c0-.325.037-.821.131-1.432.662-4.466 4.145-15.296 16.35-15.296 13.878 0 16.852 13.88 16.852 18.215v24.663h4.708V420.91c0-14.255-9.79-24.165-21.434-24.165z"
						fill="#88dbdf"
					/>
					<path d="M354.406 344.453v9.711a24.952 24.952 0 0 0-1.698-2.115c-4.101-4.514-9.164-7.001-15.177-7.472a26.793 26.793 0 0 0-2.14-.091c-.728 0-1.44.035-2.142.091-6.042.472-11.115 2.974-15.219 7.511-4.147 4.585-6.225 9.993-6.242 16.225l-.001.068.001.064c.017 6.288 2.216 11.786 6.6 16.495 4.398 4.724 10.062 7.086 17.003 7.086 6.91 0 12.564-2.362 16.964-7.086a26.564 26.564 0 0 0 2.049-2.524v24.037a24.16 24.16 0 0 0-1.697-2.108c-4.578-5.045-10.35-7.564-17.315-7.564-6.995 0-12.779 2.535-17.361 7.602-4.147 4.583-6.225 9.99-6.242 16.225l-.001.068.001.062c.017 6.286 2.216 11.79 6.6 16.496 4.397 4.722 10.062 7.085 17.003 7.085 6.91 0 12.562-2.363 16.966-7.085a26.984 26.984 0 0 0 2.047-2.527v9.747h5.027v-99.999h-5.026zm-18.855 42.967c-10.515 0-19.037-8.522-19.037-19.037 0-10.514 8.522-19.034 19.037-19.034 9.676 0 17.644 7.223 18.854 16.569v4.933c-1.21 9.346-9.178 16.569-18.854 16.569zm.003 52.289c-10.517 0-19.039-8.521-19.039-19.036 0-10.516 8.522-19.034 19.039-19.034 9.676 0 17.641 7.22 18.852 16.569v4.933c-1.211 9.346-9.176 16.568-18.852 16.568z" />
				</svg>
				<div
					style={{
						fontWeight: 600,
						fontSize: 48,
						textAlign: "center",
						textWrap: "balance",
					}}
				>
					{title}
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{
					data: font,
					name: "Inter",
					style: "normal",
					weight: 600,
				},
			],
		},
	);
}
