import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
	addons: [
		"@storybook/addon-onboarding",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-a11y",
		"storybook-next-intl",
	],
	features: {
		experimentalRSC: true,
	},
	framework: {
		name: "@storybook/nextjs",
		options: {},
	},
	staticDirs: ["../../public"],
	stories: ["../../stories/**/*.mdx", "../../stories/**/*.stories.@(ts|tsx)"],
};

export default config;
