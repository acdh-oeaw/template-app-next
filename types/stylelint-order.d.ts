declare module "stylelint-order" {
	import type { Rule } from "stylelint";

	const plugins: Array<{ ruleName: string; rule: Rule }>;

	export default plugins;
}
