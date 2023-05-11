import { Fragment, type ReactNode } from "react";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers(props: ProvidersProps): ReactNode {
	const { children } = props;

	return <Fragment>{children}</Fragment>;
}
