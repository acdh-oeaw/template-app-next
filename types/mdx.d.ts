import type * as runtime from "react/jsx-runtime";

import type { IntlLanguage } from "@/lib/i18n/locales";

declare module "@acdh-oeaw/mdx-lib" {
	export interface MdxConfig {
		locales: IntlLanguage;
	}
}

declare module "mdx/types" {
	namespace JSX {
		type Element = runtime.JSX.Element;
		type ElementClass = runtime.JSX.ElementClass;
		type IntrinsicElements = runtime.JSX.IntrinsicElements;
	}
}
