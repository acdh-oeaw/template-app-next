import type { ReactNode } from "react";
import type { Thing, WithContext } from "schema-dts";

import { serializeJsonLd } from "#/lib/metadata/serialize-json-ld.ts";

interface JsonLdProps {
	data: WithContext<Thing>;
}

export function JsonLd(props: Readonly<JsonLdProps>): ReactNode {
	const { data } = props;

	return <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} type="application/ld+json" />;
}
