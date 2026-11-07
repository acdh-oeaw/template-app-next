import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";

async function ThrowError(): Promise<ReactNode> {
	await connection();

	throw new Error("Secret server error");
}

export default function ServerErrorPage(): ReactNode {
	return (
		<main>
			<h1>Server error</h1>
			<Suspense>
				<ThrowError />
			</Suspense>
		</main>
	);
}
