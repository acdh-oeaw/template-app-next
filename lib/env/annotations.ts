import * as v from "valibot";

type Schema = v.GenericSchema & {
	default?: unknown;
	literal?: unknown;
	options?: ReadonlyArray<unknown>;
	wrapped?: Schema;
};

export type EnvDefault = { kind: "none" } | { kind: "static"; value: unknown } | { kind: "dynamic" };

/** When a deployed app reads a variable, so that `bun run env:deploy` provides it to the build, the container or both. */
export type EnvPhase = "build" | "runtime";

export interface EnvAnnotations {
	allowed?: ReadonlyArray<unknown>;
	default: EnvDefault;
	description?: string;
	dev?: unknown;
	phases?: ReadonlyArray<EnvPhase>;
	/** The image is public, so `bun run env:deploy` rejects secrets for the build, unless the build output has one anyway. */
	isSecretAllowedInBuild?: boolean;
}

type Metadata = Pick<EnvAnnotations, "dev" | "isSecretAllowedInBuild" | "phases">;

export function getAnnotations(schema: v.GenericSchema): EnvAnnotations {
	let current = schema as Schema;
	let description = v.getDescription(current);
	let { dev, isSecretAllowedInBuild, phases } = v.getMetadata(current) as Metadata;
	let defaultValue = current.default;

	while (current.wrapped != null) {
		current = current.wrapped;
		description ??= v.getDescription(current);
		const metadata = v.getMetadata(current) as Metadata;
		dev ??= metadata.dev;
		isSecretAllowedInBuild ??= metadata.isSecretAllowedInBuild;
		phases ??= metadata.phases;
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
		dev,
		isSecretAllowedInBuild,
		phases,
	};
}
