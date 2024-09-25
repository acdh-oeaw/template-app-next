import { registerOTel } from "@vercel/otel";

import { traceExporter } from "./instrumentation.node";

export function register() {
	registerOTel({
		serviceName: "ACDH-CH App",
		traceExporter: traceExporter,
	});
}
