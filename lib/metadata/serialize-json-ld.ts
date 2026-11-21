import type { Thing, WithContext } from "schema-dts";

/** Escapes `<`, so that strings cannot close the `<script>` element. */
export function serializeJsonLd(data: WithContext<Thing>): string {
	return JSON.stringify(data).replaceAll("<", "\\u003c");
}
