import "server-only";

import { hasLocale } from "next-intl";
import { getExtracted } from "next-intl/server";
import { headers } from "next/headers";
import { unstable_rethrow as rethrow } from "next/navigation";
import * as v from "valibot";

import { defaultLocale, type Locale } from "#/lib/i18n/locales.ts";
import { routing } from "#/lib/i18n/routing.ts";
import { NetworkError, TimeoutError } from "#/lib/request/errors.ts";
import { ActionError } from "#/lib/server-actions/action-error.ts";
import type { ActionState, ActionStateError, FieldErrors, FormValues } from "#/lib/server-actions/action-state.ts";
import { getFormDataValues, getFormValues } from "#/lib/server-actions/form-data.ts";

type Translator = Awaited<ReturnType<typeof getExtracted>>;

export interface ServerActionContext {
	locale: Locale;
	t: Translator;
}

type Schema = v.GenericSchema | v.GenericSchemaAsync;

interface CreateServerActionOptions<TSchema extends Schema, TData> {
	/** Created for each request, so that its messages can be translated with `t`. */
	schema: (context: ServerActionContext) => TSchema;
	/** Fields whose values are not sent back to the client, like passwords. */
	omitValues?: ReadonlyArray<string>;
	/** Throws an `ActionError` for expected failures, which the user sees. */
	handler: (input: v.InferOutput<TSchema>, context: ServerActionContext) => Promise<TData>;
}

export type ServerAction<TData> = (state: ActionState<TData>, formData: FormData) => Promise<ActionState<TData>>;

/**
 * Creates a server action for `useActionState`. It validates the form data with `schema`, and returns field errors for
 * invalid input. An `ActionError` from `handler` returns its message, other errors are logged, and return a generic
 * message, because Next.js hides the message of a thrown error in production. `redirect()` and `notFound()` work as
 * usual.
 */
export function createServerAction<TSchema extends Schema, TData = undefined>(
	options: CreateServerActionOptions<TSchema, TData>,
): ServerAction<TData> {
	const { handler, omitValues = [], schema } = options;

	return async function serverAction(_state, formData) {
		const locale = await getActionLocale();
		const t = await getExtracted({ locale });
		const context: ServerActionContext = { locale, t };

		const values = getFormDataValues(formData);
		const formValues = getFormValues(values, omitValues);

		try {
			/** Inside `try`, because async schemas can make requests, which can fail like the handler's. */
			const result = await v.safeParseAsync(schema(context), values);

			if (!result.success) {
				const { nested, root } = v.flatten(result.issues);

				return createErrorState({
					message: root?.[0] ?? t("Please correct the highlighted fields."),
					fieldErrors: toFieldErrors(nested),
					values: formValues,
				});
			}

			const data = await handler(result.output, context);

			return { status: "success", id: crypto.randomUUID(), data };
		} catch (error) {
			rethrow(error);

			if (error instanceof ActionError) {
				return createErrorState({ message: error.message, fieldErrors: error.fieldErrors, values: formValues });
			}

			/** A caught error does not reach Next.js, which would log it. */
			// oxlint-disable-next-line no-console
			console.error(error);

			const message =
				error instanceof TimeoutError || error instanceof NetworkError
					? t("The service is not available. Please try again later.")
					: t("An unexpected error occurred. Please try again.");

			return createErrorState({ message, fieldErrors: {}, values: formValues });
		}
	};
}

/**
 * `next/root-params` throws in server actions, so read the locale from the header that the proxy sets for every request
 * it handles, including the requests of server actions.
 */
async function getActionLocale(): Promise<Locale> {
	const locale = (await headers()).get("x-next-intl-locale");

	return hasLocale(routing.locales, locale) ? locale : defaultLocale;
}

function createErrorState(params: { fieldErrors: FieldErrors; message: string; values: FormValues }): ActionStateError {
	return { status: "error", id: crypto.randomUUID(), ...params };
}

function toFieldErrors(nested: Partial<Record<string, Array<string>>> | undefined): FieldErrors {
	return Object.fromEntries(
		Object.entries(nested ?? {}).filter((entry): entry is [string, Array<string>] => entry[1] != null),
	);
}
