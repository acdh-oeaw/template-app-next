import {
	createAssetOptions,
	createCollection,
	createContentFieldOptions,
	createLabel,
	withI18nPrefix,
} from "@acdh-oeaw/keystatic-lib";
import { collection, fields } from "@keystatic/core";

import {
	createCallout,
	createDisclosure,
	createEmbed,
	createFigure,
	createFootnote,
	createGrid,
	createHeadingId,
	createLink,
	createLinkButton,
	// createTableOfContents,
	createTabs,
	createVideo,
} from "@/lib/keystatic/components";
import { createPreviewUrl } from "@/lib/keystatic/create-preview-url";

export const createDocumentationCollection = createCollection(
	"/documentation/",
	(paths, language) => {
		return collection({
			label: createLabel("Documentation", language),
			path: paths.contentPath,
			format: { contentField: "content" },
			slugField: "title",
			columns: ["title"],
			entryLayout: "content",
			previewUrl: createPreviewUrl("/documentation/{slug}"),
			schema: {
				title: fields.slug({
					name: {
						label: "Title",
						validation: { isRequired: true },
					},
				}),
				lead: fields.text({
					label: "Lead",
					validation: { isRequired: true },
					multiline: true,
				}),
				// "publication-date": fields.date({
				// 	label: "Publication date",
				// 	validation: { isRequired: true },
				// 	defaultValue: { kind: "today" },
				// }),
				// image: fields.image({
				// 	label: "Image",
				// 	validation: { isRequired: true },
				// 	...createAssetOptions(paths.assetPath),
				// }),
				authors: fields.multiRelationship({
					label: "Authors",
					validation: { length: { min: 1 } },
					collection: withI18nPrefix("people", language),
				}),
				content: fields.mdx({
					label: "Content",
					options: {
						...createContentFieldOptions(paths),
						/**
						 * Prefer `<Link>` component over regular markdown links.
						 * Note that this also disables *parsing* regular markdown links.
						 */
						link: false,
					},
					components: {
						...createCallout(paths, language),
						...createDisclosure(paths, language),
						...createEmbed(paths, language),
						...createFigure(paths, language),
						...createFootnote(paths, language),
						...createGrid(paths, language),
						...createHeadingId(paths, language),
						...createLink(paths, language),
						...createLinkButton(paths, language),
						// ...createTableOfContents(paths, language),
						...createTabs(paths, language),
						...createVideo(paths, language),
					},
				}),
			},
		});
	},
);

export const createPeopleCollection = createCollection("/people/", (paths, language) => {
	return collection({
		label: createLabel("People", language),
		path: paths.contentPath,
		format: { contentField: "content" },
		slugField: "name",
		columns: ["name"],
		entryLayout: "form",
		// previewUrl: createPreviewUrl("/people/{slug}"),
		schema: {
			name: fields.slug({
				name: {
					label: "Name",
					validation: { isRequired: true },
				},
			}),
			image: fields.image({
				label: "Image",
				validation: { isRequired: true },
				...createAssetOptions(paths.assetPath),
			}),
			content: fields.mdx({
				label: "Content",
				options: {
					...createContentFieldOptions(paths),
					blockquote: false,
					codeBlock: false,
					image: false,
					/**
					 * Prefer `<Link>` component over regular markdown links.
					 * Note that this also disables *parsing* regular markdown links.
					 */
					link: false,
					table: false,
				},
				components: {
					// ...createCallout(paths, language),
					// ...createDisclosure(paths, language),
					// ...createEmbed(paths, language),
					// ...createFigure(paths, language),
					// ...createFootnote(paths, language),
					// ...createGrid(paths, language),
					// ...createHeadingId(paths, language),
					...createLink(paths, language),
					// ...createLinkButton(paths, language),
					// ...createTableOfContents(paths, language),
					// ...createTabs(paths, language),
					// ...createVideo(paths, language),
				},
			}),
		},
	});
});
