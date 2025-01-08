import { defineConfig } from "tinacms";

// eslint-disable-next-line import-x/no-default-export
export default defineConfig({
	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},
	media: {
		tina: {
			mediaRoot: "",
			publicFolder: "public",
		},
	},
	schema: {
		collections: [
			{
				name: "post",
				label: "Posts",
				path: "content/en/posts",
				fields: [
					{
						type: "string",
						name: "title",
						label: "Title",
						isTitle: true,
						required: true,
					},
					{
						type: "rich-text",
						name: "body",
						label: "Body",
						isBody: true,
					},
				],
				ui: {
					router({ document }) {
						return `/en/posts/${document._sys.filename}`;
					},
				},
			},
		],
	},
});
