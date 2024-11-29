import type { StorybookConfig } from "@storybook/nextjs-vite";
import tsConfigPathsPlugin from "vite-tsconfig-paths";

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
	viteFinal(config) {
		config.plugins ??= [];
		config.plugins.push(tsConfigPathsPlugin());
		return config;
	},
};

export default config;
