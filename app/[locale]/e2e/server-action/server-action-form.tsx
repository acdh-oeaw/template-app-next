"use client";

import { useActionState, useSyncExternalStore } from "react";
import { FieldError, Form, Input, Label, TextField } from "react-aria-components";

import { serverActionFixture } from "#/app/[locale]/e2e/server-action/actions.ts";
import { idleActionState } from "#/lib/server-actions/action-state.ts";

export function ServerActionForm(): React.ReactNode {
	const [state, action] = useActionState(serverActionFixture, idleActionState);

	const name = state.status === "error" ? state.values.name : undefined;

	/** Typing before hydration is lost when React Aria takes over the field, so tests wait for this. */
	const hydration = useSyncExternalStore(
		subscribe,
		() => "hydrated",
		() => "server",
	);

	return (
		<Form action={action} validationErrors={state.status === "error" ? state.fieldErrors : undefined}>
			<TextField defaultValue={typeof name === "string" ? name : ""} name="name">
				<Label>Name</Label>
				<Input />
				<FieldError />
			</TextField>

			{state.status === "error" ? <p role="alert">{state.message}</p> : null}
			{state.status === "success" ? <p role="status">Saved {state.data.name}</p> : null}

			{hydration === "hydrated" ? <p>Hydrated</p> : null}

			<button name="outcome" type="submit" value="success">
				Succeed
			</button>
			<button name="outcome" type="submit" value="action-error">
				Fail expectedly
			</button>
			<button name="outcome" type="submit" value="error">
				Fail unexpectedly
			</button>
			<button name="outcome" type="submit" value="timeout">
				Time out
			</button>
			<button name="outcome" type="submit" value="validation-timeout">
				Time out during validation
			</button>
			<button name="outcome" type="submit" value="redirect">
				Redirect
			</button>
		</Form>
	);
}

function subscribe(): () => void {
	return () => undefined;
}
