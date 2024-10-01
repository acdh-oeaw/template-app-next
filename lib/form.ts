interface InitialActionState {
	status: "initial";
}

interface SuccessActionState {
	status: "success";
	message: string;
	timestamp: number;
}

interface ErrorActionState {
	status: "error";
	message: string;
	timestamp: number;
}

export type ActionState = InitialActionState | SuccessActionState | ErrorActionState;

export function createInitialActionState(): InitialActionState {
	return { status: "initial" };
}

export function createSuccessActionState(message: string): SuccessActionState {
	return { status: "success", message, timestamp: Date.now() };
}

export function createErrorActionState(message: string): ErrorActionState {
	return { status: "error", message, timestamp: Date.now() };
}
