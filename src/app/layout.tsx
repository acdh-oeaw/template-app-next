import { type Metadata } from "next";
import { type ReactNode } from "react";

import { env } from "~/config/env.config";

interface Props {
	children: ReactNode;
}

export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_BASE_URL),
	alternates: {
		canonical: "./",
	},
};

/**
 * This file fixes an issue in Next.js 13.4 where link clicks that switch the locale would
 * otherwise cause a full reload.
 */
export default function RootLayout(props: Props): ReactNode {
	const { children } = props;

	return children;
}
