 
import { type MDXComponents } from "mdx/types";

const shared = {} as MDXComponents;

export function useMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...shared,
		...components,
	};
}
