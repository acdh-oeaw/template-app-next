import "server-only";

import { join } from "node:path";
import { pathToFileURL } from "node:url";

import type { CompileOptions } from "@mdx-js/mdx";
import withSyntaxHighlighter from "@shikijs/rehype";
import type { ElementContent } from "hast";
import { getLocale, getTranslations } from "next-intl/server";
import withAssets from "rehype-mdx-import-media";
import withHeadingIds from "rehype-slug";
import withFrontmatter from "remark-frontmatter";
import withGfm from "remark-gfm";
import withMdxFrontmatter from "remark-mdx-frontmatter";
import withTypographicQuotes from "remark-smartypants";
import type { Options as TypographicOptions } from "retext-smartypants";

import type { Locale } from "@/config/i18n.config";
import { config as syntaxHighlighterConfig } from "@/config/syntax-highlighter.config";
import { withMdxFootnotes } from "@/lib/content/footnotes";
import { withMdxTableOfContents, withTableOfContents } from "@/lib/content/table-of-contents";

const configs = new Map<Locale, CompileOptions>();

const typography: Record<Locale, TypographicOptions> = {
	de: {
		openingQuotes: { double: "„", single: "‚" },
		closingQuotes: { double: "“", single: "‘" },
	},
	en: {
		openingQuotes: { double: "“", single: "‘" },
		closingQuotes: { double: "”", single: "’" },
	},
};

export async function createConfig(): Promise<CompileOptions> {
	const locale = (await getLocale()) as Locale;
	const t = await getTranslations();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (configs.has(locale)) return configs.get(locale)!;

	const config: CompileOptions = {
		/** Keystatic will always save assets to the public folder. */
		baseUrl: pathToFileURL(join(process.cwd(), "public")),
		remarkPlugins: [
			withFrontmatter,
			withMdxFrontmatter,
			withGfm,
			[withTypographicQuotes, typography[locale]],
			withMdxFootnotes,
		],
		remarkRehypeOptions: {
			/** @see https://github.com/syntax-tree/mdast-util-to-hast/blob/13.0.0/lib/footer.js#L81 */
			footnoteBackContent(_, rereferenceIndex) {
				const result: Array<ElementContent> = [{ type: "text", value: "↩" }];

				if (rereferenceIndex > 1) {
					result.push({
						type: "element",
						tagName: "sup",
						properties: {},
						children: [{ type: "text", value: String(rereferenceIndex) }],
					});
				}

				return result;
			},
			/** @see https://github.com/syntax-tree/mdast-util-to-hast/blob/13.0.0/lib/footer.js#L108 */
			footnoteBackLabel(referenceIndex, rereferenceIndex) {
				return t("Mdx.FootnoteBackLabel", {
					reference:
						String(referenceIndex + 1) +
						(rereferenceIndex > 1 ? `-${String(rereferenceIndex)}` : ""),
				});
			},
			footnoteLabel: t("Mdx.Footnotes"),
			footnoteLabelProperties: { className: ["sr-only"] },
			footnoteLabelTagName: "h2",
		},
		rehypePlugins: [
			withHeadingIds,
			withTableOfContents,
			withMdxTableOfContents,
			[withSyntaxHighlighter, syntaxHighlighterConfig],
			withAssets,
		],
	};

	configs.set(locale, config);

	return config;
}
