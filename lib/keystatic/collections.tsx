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
import { image as imageField } from "@/lib/keystatic/fields/image";

export const createDocumentationCollection = createCollection(
	"/documentation/",
	(paths, locale) => {
		return collection({
			label: createLabel("Documentation", locale),
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
				image: imageField({
					label: "IMAGE",
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
					collection: withI18nPrefix("people", locale),
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
						...createCallout(paths, locale),
						...createDisclosure(paths, locale),
						...createEmbed(paths, locale),
						...createFigure(paths, locale),
						...createFootnote(paths, locale),
						...createGrid(paths, locale),
						...createHeadingId(paths, locale),
						...createLink(paths, locale),
						...createLinkButton(paths, locale),
						// ...createTableOfContents(paths, locale),
						...createTabs(paths, locale),
						...createVideo(paths, locale),
					},
				}),
			},
		});
	},
);

export const createPeopleCollection = createCollection("/people/", (paths, locale) => {
	return collection({
		label: createLabel("People", locale),
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
					// ...createCallout(paths, locale),
					// ...createDisclosure(paths, locale),
					// ...createEmbed(paths, locale),
					// ...createFigure(paths, locale),
					// ...createFootnote(paths, locale),
					// ...createGrid(paths, locale),
					// ...createHeadingId(paths, locale),
					...createLink(paths, locale),
					// ...createLinkButton(paths, locale),
					// ...createTableOfContents(paths, locale),
					// ...createTabs(paths, locale),
					// ...createVideo(paths, locale),
				},
			}),
		},
	});
});
