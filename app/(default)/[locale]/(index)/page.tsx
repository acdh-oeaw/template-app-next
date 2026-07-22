import type { ReactNode } from "react";

interface IndexPageProps extends PageProps<"/"> {}

export default function IndexPage(_props: Readonly<IndexPageProps>): ReactNode {
	return <h1>Hello, World!</h1>;
}
