import { connection } from "next/server";

/**
 * Liveness probe: a failure restarts the container, so only check the process itself, never external dependencies.
 * Waits for a request, so it is never prerendered.
 */
export async function GET(): Promise<Response> {
	await connection();

	return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
