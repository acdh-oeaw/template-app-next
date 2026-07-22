import type { Spec } from "axe-core";

export const config: Pick<Spec, "rules"> = {
	rules: [
		/** @see {@link https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives} */
		{
			id: "aria-hidden-focus",
			selector: '[aria-hidden="true"]:not([data-a11y-ignore="aria-hidden-focus"])',
		},
	],
};
