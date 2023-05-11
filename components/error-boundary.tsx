"use client";

import { assert } from "@acdh-oeaw/lib";
import { Component, createContext, type ErrorInfo, type ReactNode, useContext } from "react";

interface ErrorBoundaryContextValue {
	error: unknown;
	onReset: () => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

export function useError(): ErrorBoundaryContextValue {
	const value = useContext(ErrorBoundaryContext);

	assert(value != null);

	return value;
}

//

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback: ReactNode;
	onError?: (error: unknown, info: ErrorInfo) => void;
	onReset?: () => void;
}

type ErrorBoundaryState = { status: "default" } | { status: "error"; error: unknown };

const initialState: ErrorBoundaryState = { status: "default" };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);

		this.onReset = this.onReset.bind(this);

		this.state = initialState;
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { status: "error", error };
	}

	componentDidCatch(error: unknown, info: ErrorInfo): void {
		this.props.onError?.(error, info);
	}

	onReset(): void {
		this.props.onReset?.();
		this.setState(initialState);
	}

	render(): ReactNode {
		if (this.state.status === "error") {
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const contextValue = { error: this.state.error, onReset: this.onReset };

			return (
				<ErrorBoundaryContext.Provider value={contextValue}>
					{this.props.fallback}
				</ErrorBoundaryContext.Provider>
			);
		}

		return this.props.children;
	}
}
