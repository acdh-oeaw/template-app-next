"use client";

import Error from "next/error";
import { type ReactNode } from "react";

/**
 * This page renders when a route is requested that doesn't match the
 * middleware and therefore doesn't have a locale associated with it.
 */

// TODO: see global-error
export default function NotFound(): ReactNode {
	return (
		<html lang="en">
			<body>
				<Error statusCode={404} />
			</body>
		</html>
	);
}
