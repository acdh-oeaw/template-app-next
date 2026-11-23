import "server-only";

import { hasLocale } from "next-intl";
import { getExtracted } from "next-intl/server";
import { headers } from "next/headers";
import { unstable_rethrow as rethrow } from "next/navigation";
import * as v from "valibot";

import { defaultLocale, type Locale, locales } from "#/lib/i18n/locales.ts";
import { isServiceUnavailableError } from "#/lib/request/errors.ts";
import { ActionError } from "#/lib/server-actions/action-error.ts";
import type { ActionState, ActionStateError, FieldErrors, FormValues } from "#/lib/server-actions/action-state.ts";
import { getFormDataValues, getFormValues } from "#/lib/server-actions/form-data.ts";
import { getValidationErrors } from "#/lib/server-actions/validation.ts";

/**
 * Translate messages with `await getExtracted({ locale })`. A `t` passed in the context would not work, because
 * next-intl only extracts messages of a `t` that is bound to the result of `getExtracted()`.
 */
export interface ServerActionContext {
	locale: Locale;
}

type Schema = v.GenericSchema | v.GenericSchemaAsync;

type EmptySchema = ReturnType<typeof createEmptySchema>;

/** Values that `guard` adds to the context, which cannot replace the ones of `ServerActionContext`. */
type GuardContext = Partial<Record<keyof ServerActionContext, never>> & Record<string, unknown>;

/** A guard that only checks returns nothing. */
// oxlint-disable-next-line no-invalid-void-type
type GuardResult = Promise<GuardContext | void> | GuardContext | void;

type GuardedContext<TGuardResult extends GuardResult> = [Exclude<Awaited<TGuardResult>, void>] extends [never]
	? ServerActionContext
	: ServerActionContext & Exclude<Awaited<TGuardResult>, void>;

interface CreateServerActionOptions<TSchema extends Schema, TGuardResult extends GuardResult, TData> {
	/**
	 * Checks whether the request may run the action, like authorization and rate limiting, in the order they are called.
	 * Runs before `schema`, so that async checks in the schema, like whether a name is taken, don't run for rejected
	 * requests. Throws an `ActionError`, or calls `redirect()`, to reject a request. Returns values that `schema` and
	 * `handler` receive in their context, like the user.
	 */
	guard?: (context: ServerActionContext) => TGuardResult;
	/**
	 * Created for each request, so that its messages can be translated with `await getExtracted({ locale })`. Checks
	 * without a message use a generic translated one, instead of valibot's untranslated default. Without a schema, the
	 * handler receives an empty object, for actions without input, like signing out.
	 */
	schema?: (context: GuardedContext<TGuardResult>) => Promise<TSchema> | TSchema;
	/** Fields whose values are not sent back to the client, like passwords. */
	omitValues?: ReadonlyArray<string>;
	/**
	 * Throws an `ActionError` for expected failures, which the user sees. Returns data that React can serialize, because
	 * a serialization error happens after the handler has run, and reaches the error boundary.
	 */
	handler: (input: v.InferOutput<TSchema>, context: GuardedContext<TGuardResult>) => Promise<TData>;
}

export type ServerAction<TData> = (state: ActionState<TData>, formData: FormData) => Promise<ActionState<TData>>;

/**
 * Creates a server action for `useActionState`. It checks `guard`, validates the form data with `schema`, and returns
 * field errors for invalid input. An `ActionError` from `handler` returns its message, other errors are logged, and
 * return a generic message, because Next.js hides the message of a thrown error in production. `redirect()` and
 * `notFound()` work as usual.
 */
export function createServerAction<
	TSchema extends Schema = EmptySchema,
	TGuardResult extends GuardResult = void,
	TData = undefined,
>(options: CreateServerActionOptions<TSchema, TGuardResult, TData>): ServerAction<TData> {
	const { guard, handler, omitValues = [], schema = createEmptySchema } = options;

	return async function serverAction(_state, formData) {
		const locale = await getActionLocale();
		const t = await getExtracted({ locale });
		const context: ServerActionContext = { locale };

		const values = getFormDataValues(formData);
		const formValues = getFormValues(values, omitValues);

		try {
			/** The values of `context` come last, so that `guard` cannot replace them at runtime either. */
			const guardResult: GuardResult = guard?.(context);
			const guardedContext = { ...(await guardResult), ...context } as GuardedContext<TGuardResult>;

			/** Inside `try`, because async schemas can make requests, which can fail like the handler's. */
			const result = await v.safeParseAsync(await schema(guardedContext), values, {
				message: t("Enter a valid value."),
			});

			if (!result.success) {
				const { fieldErrors, rootErrors } = getValidationErrors(result.issues);

				return createErrorState({
					message: rootErrors.length > 0 ? rootErrors.join(" ") : t("Please correct the highlighted fields."),
					fieldErrors,
					values: formValues,
				});
			}

			const data = await handler(result.output, guardedContext);

			return { status: "success", id: crypto.randomUUID(), data };
		} catch (error) {
			rethrow(error);

			if (error instanceof ActionError) {
				return createErrorState({ message: error.message, fieldErrors: error.fieldErrors, values: formValues });
			}

			/** A caught error does not reach Next.js, which would log it and pass it to `onRequestError`, so report it here. */
			// oxlint-disable-next-line no-console
			console.error(error);

			const message = isServiceUnavailableError(error)
				? t("The service is not available. Please try again later.")
				: t("An unexpected error occurred. Please try again.");

			return createErrorState({ message, fieldErrors: {}, values: formValues });
		}
	};
}

function createEmptySchema() {
	return v.object({});
}

/**
 * `next/root-params` throws in server actions, so read the locale from the header that the proxy sets for every request
 * it handles, including the requests of server actions. Without i18n routing, there is no proxy, and no header.
 */
async function getActionLocale(): Promise<Locale> {
	const locale = (await headers()).get("x-next-intl-locale");

	return hasLocale(locales, locale) ? locale : defaultLocale;
}

function createErrorState(params: { fieldErrors: FieldErrors; message: string; values: FormValues }): ActionStateError {
	return { status: "error", id: crypto.randomUUID(), ...params };
}
