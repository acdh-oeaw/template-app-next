export type FieldErrors = Record<string, Array<string>>;

export type FormValues = Record<string, string | Array<string>>;

export interface ActionStateIdle {
	status: "idle";
}

export interface ActionStateSuccess<TData> {
	status: "success";
	/** New for each response, so that the same state twice in a row is still a new state. */
	id: string;
	data: TData;
}

export interface ActionStateError {
	status: "error";
	/** New for each response, so that the same state twice in a row is still a new state. */
	id: string;
	message: string;
	/** Keyed by field name, the shape of `validationErrors` of React Aria's `<Form>`. */
	fieldErrors: FieldErrors;
	/** The submitted values, for the `defaultValue` of each field, because a form resets after its action. */
	values: FormValues;
}

/** Plain objects, because the state of a server action is serialized to the client. */
export type ActionState<TData = undefined> = ActionStateError | ActionStateIdle | ActionStateSuccess<TData>;

export const idleActionState: ActionStateIdle = { status: "idle" };
