import "server-only";

import { run } from "@mdx-js/mdx";
import {
	createFormatAwareProcessors,
	type FormatAwareProcessors,
} from "@mdx-js/mdx/internal-create-format-aware-processors";
import type { MDXModule } from "mdx/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";

import type { Locale } from "@/config/i18n.config";
import { createConfig as createMdxConfig } from "@/config/mdx.config";
import { reader } from "@/lib/content/reader";
import type { Toc } from "@/lib/content/table-of-contents";
import type { DocumentationPage } from "@/lib/content/types";
import { useMDXComponents } from "@/mdx-components";

const processors = new Map<Locale, FormatAwareProcessors>();

interface MdxContent<T extends Record<string, unknown>> extends MDXModule {
	/** Added by `remark-mdx-frontmatter`. */
	frontmatter: T;
	/** Added by `@/lib/content/table-of-contents.js`. */
	tableOfContents?: Toc;
}

export const processMdx = cache(async function processMdx<T extends Record<string, unknown>>(
	code: string,
): Promise<MdxContent<T>> {
	const locale = (await getLocale()) as Locale;

	const config = await createMdxConfig();

	if (!processors.has(locale)) {
		processors.set(
			locale,
			createFormatAwareProcessors({
				...config,
				format: "mdx",
				outputFormat: "function-body",
				providerImportSource: "#",
			}),
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const processor = processors.get(locale)!;

	const file = await processor.process(code);

	// @ts-expect-error Upstream type issue.
	return run(file, { ...runtime, useMDXComponents });
});

interface DocumentationMetadata extends Omit<DocumentationPage, "content"> {}

export async function getDocumentationContent(id: string) {
	if (draftMode().isEnabled) {
		const documentation = await reader().collections.documentation.read(id);
		if (documentation == null) notFound();

		const { content, ...frontmatter } = documentation;
		const { default: Content } = await processMdx(await content());

		return { Content, frontmatter };
	}

	const { default: Content, frontmatter } = (await import(
		`@/content/documentation/${id}.mdx`
	)) as MdxContent<DocumentationMetadata>;

	return { Content, frontmatter };
}
