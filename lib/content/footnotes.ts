import type { Root } from "mdast";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import { SKIP, visit } from "unist-util-visit";

export function withMdxFootnotes() {
	return function transformer(tree: Root) {
		let count = 1;

		const footnotes: Array<MdxJsxTextElement> = [];

		visit(tree, "mdxJsxTextElement", (node, index, parent) => {
			if (node.name === "Footnote") {
				const countAttribute: MdxJsxAttribute = {
					type: "mdxJsxAttribute",
					name: "count",
					value: String(count),
				};

				const reference: MdxJsxTextElement = {
					type: "mdxJsxTextElement",
					name: "FootnoteReference",
					attributes: [countAttribute],
					children: [],
				};

				const content: MdxJsxTextElement = {
					type: "mdxJsxTextElement",
					name: "FootnoteContent",
					attributes: [countAttribute],
					children: node.children,
				};

				// @ts-expect-error Parent node exists.
				parent.children.splice(index, 1, reference);
				footnotes.push(content);

				count++;
			}

			return SKIP;
		});

		if (footnotes.length > 0) {
			const section: MdxJsxFlowElement = {
				type: "mdxJsxFlowElement",
				name: "FootnotesSection",
				attributes: [],
				// @ts-expect-error Should be fine to set `MdxJsxTextElement` children.
				children: footnotes,
			};

			tree.children.push(section);
		}
	};
}
