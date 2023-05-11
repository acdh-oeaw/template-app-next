import type { fields } from "@keystatic/core";

import { env } from "@/config/env.config";

type FilePathsConfig = Pick<
	Exclude<NonNullable<Parameters<typeof fields.file>[0]>, true>,
	"directory" | "publicPath"
>;
type ImagePathsConfig = Pick<
	Exclude<NonNullable<Parameters<typeof fields.image>[0]>, true>,
	"directory" | "publicPath"
>;

export const paths = {
	file: {
		directory: "./public/assets/images/content/",
		publicPath: "/assets/images/content/",
	} satisfies FilePathsConfig,
	image: {
		directory: "./public/assets/images/content/",
		publicPath: "/assets/images/content/",
	} satisfies ImagePathsConfig,
};

export function createPreviewUrl(previewUrl: string) {
	if (env.NEXT_PUBLIC_KEYSTATIC_MODE === "github") {
		return `/api/preview/start?branch={branch}&to=${previewUrl}`;
	}

	return previewUrl;
}
