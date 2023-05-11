import { Callout } from "@/components/content/callout";
import { Download } from "@/components/content/download";
import { Figure } from "@/components/content/figure";
import {
	FootnoteContent,
	FootnoteReference,
	FootnotesSection,
} from "@/components/content/footnote";
import { Image } from "@/components/content/image";
import { Link } from "@/components/link";

const components = {
	a: Link,
	Callout,
	Download,
	Figure,
	FootnoteContent,
	FootnoteReference,
	FootnotesSection,
	img: Image,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
