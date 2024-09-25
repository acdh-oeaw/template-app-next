import { type GetVariantProps, styles } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

const gridStyles = styles({
	base: "grid gap-8 content-start",
	variants: {
		layout: {
			"two-columns": "sm:grid-cols-2",
			"three-columns": "sm:grid-cols-3",
		},
	},
});

type GridStylesProps = GetVariantProps<typeof gridStyles>;

interface GridProps extends GridStylesProps {
	children: ReactNode;
}

export function Grid(props: GridProps): ReactNode {
	const { children, layout } = props;

	return <div className={gridStyles({ layout })}>{children}</div>;
}

interface GridItemProps {
	children: ReactNode;
}

export function GridItem(props: GridItemProps): ReactNode {
	const { children } = props;

	return <div>{children}</div>;
}
