import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const exporterOptions = {
	url: process.env.OPENTELEMETRY_COLLECTOR_URL,
};

export const traceExporter = new OTLPTraceExporter(exporterOptions);
