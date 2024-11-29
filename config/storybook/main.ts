import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
	addons: [
		"@storybook/addon-onboarding",
		"@chromatic-com/storybook",
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-themes",
		"@storybook/addon-vitest",
		"storybook-next-intl",
	],
	features: {
		experimentalRSC: true,
	},
	framework: {
		name: "@storybook/nextjs-vite",
		options: {},
	},
	staticDirs: ["../../public"],
	stories: ["../../stories/**/*.mdx", "../../stories/**/*.stories.@(ts|tsx)"],
	typescript: {
		reactDocgen: "react-docgen-typescript",
		reactDocgenTypescriptOptions: {
			propFilter: (prop) => {
				return !prop.name.startsWith("aria-");
			},
			shouldExtractLiteralValuesFromEnum: true,
		},
	},
};

export default config;
