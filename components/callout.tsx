import type { ReactNode } from "react";

import { type VariantProps, variants } from "@/lib/styles";

const calloutStyles = variants({
	base: "my-4 rounded-md border p-4 text-sm",
	variants: {
		kind: {
			caution: "",
			important: "",
			note: "",
			tip: "",
			warning: "",
		},
	},
	defaultVariants: {
		kind: "note",
	},
});

type CalloutStyleProps = VariantProps<typeof calloutStyles>;

interface CalloutProps {
	children: ReactNode;
	/** @default "note" */
	kind: CalloutStyleProps["kind"];
}

export function Callout(props: CalloutProps): ReactNode {
	const { children, kind } = props;

	return <aside className={calloutStyles({ kind })}>{children}</aside>;
}
