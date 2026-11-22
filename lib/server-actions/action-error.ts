import type { FieldErrors } from "#/lib/server-actions/action-state.ts";

/**
 * An expected failure of a server action, like an email address that is already registered. The message is shown to the
 * user, so translate it.
 */
export class ActionError extends Error {
	override readonly name = "ActionError";
	readonly fieldErrors: FieldErrors;

	constructor(message: string, options?: { cause?: unknown; fieldErrors?: FieldErrors }) {
		super(message, { cause: options?.cause });
		this.fieldErrors = options?.fieldErrors ?? {};
	}
}
