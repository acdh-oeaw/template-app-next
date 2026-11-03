import * as v from "valibot";

type Schema = v.GenericSchema & {
	default?: unknown;
	literal?: unknown;
	options?: ReadonlyArray<unknown>;
	wrapped?: Schema;
};

export type EnvDefault = { kind: "none" } | { kind: "static"; value: unknown } | { kind: "dynamic" };

export interface EnvAnnotations {
	allowed?: ReadonlyArray<unknown>;
	default: EnvDefault;
	description?: string;
	dev?: unknown;
}

export function getAnnotations(schema: v.GenericSchema): EnvAnnotations {
	let current = schema as Schema;
	let description = v.getDescription(current);
	let metadata = v.getMetadata(current);
	let defaultValue = current.default;

	while (current.wrapped != null) {
		current = current.wrapped;
		description ??= v.getDescription(current);
		metadata = { ...v.getMetadata(current), ...metadata };
		defaultValue ??= current.default;
	}

	const allowed =
		current.type === "picklist" ? current.options : current.type === "literal" ? [current.literal] : undefined;

	return {
		allowed,
		default:
			defaultValue === undefined
				? { kind: "none" }
				: typeof defaultValue === "function"
					? { kind: "dynamic" }
					: { kind: "static", value: defaultValue },
		description,
		dev: metadata.dev,
	};
}
