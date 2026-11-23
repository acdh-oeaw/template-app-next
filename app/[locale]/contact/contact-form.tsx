"use client";

import { useExtracted as useTranslations } from "next-intl";
import { type ReactNode, useActionState } from "react";
import { FieldError, Form, Input, Label, TextArea, TextField } from "react-aria-components";

import { sendContactMessageAction } from "#/app/[locale]/contact/actions.ts";
import { idleActionState } from "#/lib/server-actions/action-state.ts";

export function ContactForm(): ReactNode {
	const t = useTranslations();

	const [state, action] = useActionState(sendContactMessageAction, idleActionState);

	function getDefaultValue(name: string): string {
		const value = state.status === "error" ? state.values[name] : undefined;
		return typeof value === "string" ? value : "";
	}

	return (
		<Form
			action={action}
			className="flex max-w-prose flex-col gap-4"
			validationErrors={state.status === "error" ? state.fieldErrors : undefined}
		>
			<TextField className="flex flex-col gap-1" defaultValue={getDefaultValue("name")} isRequired={true} name="name">
				<Label>{t("Name")}</Label>
				<Input autoComplete="name" maxLength={200} />
				<FieldError />
			</TextField>

			<TextField
				className="flex flex-col gap-1"
				defaultValue={getDefaultValue("email")}
				isRequired={true}
				name="email"
				type="email"
			>
				<Label>{t("Email address")}</Label>
				<Input autoComplete="email" />
				<FieldError />
			</TextField>

			<TextField
				className="flex flex-col gap-1"
				defaultValue={getDefaultValue("message")}
				isRequired={true}
				name="message"
			>
				<Label>{t("Message")}</Label>
				<TextArea maxLength={5000} rows={8} />
				<FieldError />
			</TextField>

			{/* Hidden from people, including screen reader users, but bots that fill in every field find it. */}
			<div hidden={true}>
				<label>
					Website
					<input autoComplete="off" name="website" tabIndex={-1} type="text" />
				</label>
			</div>

			{state.status === "error" ? <p role="alert">{state.message}</p> : null}
			{state.status === "success" ? <p role="status">{t("Thank you, your message has been sent.")}</p> : null}

			<div>
				<button type="submit">{t("Send")}</button>
			</div>
		</Form>
	);
}
