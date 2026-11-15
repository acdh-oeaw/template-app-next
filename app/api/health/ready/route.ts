import { connection } from "next/server";

/**
 * Readiness probe: a failure stops traffic to the pod without restarting it, so check dependencies the app needs to
 * serve requests here. Waits for a request, so it is never prerendered.
 */
export async function GET(): Promise<Response> {
	await connection();

	return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
