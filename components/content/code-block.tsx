import "server-only";

import type { ReactNode } from "react";
import { codeToHtml } from "shiki";

import { config as syntaxHighlighterConfig } from "@/config/syntax-highlighter.config";

interface CodeBlockProps {
	code: string;
	language: string;
}

export async function CodeBlock(props: CodeBlockProps): Promise<Awaited<ReactNode>> {
	const { code, language } = props;

	const html = await codeToHtml(code, {
		...syntaxHighlighterConfig,
		lang: language,
	});

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
