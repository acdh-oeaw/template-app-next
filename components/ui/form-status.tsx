"use client";

import { AlertTriangle, CheckCircle2Icon } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { FormErrorMessage } from "@/components/form-error-message";
import { FormSuccessMessage } from "@/components/form-success-message";
import type { ActionState } from "@/lib/server/actions";

interface FormStatusProps {
	state: ActionState;
}

export function FormStatus(props: Readonly<FormStatusProps>): ReactNode {
	const { state } = props;

	return (
		<Fragment>
			<FormErrorMessage
				className="min-h-12 rounded-2 border border-stroke-error-weak bg-fill-error-weak px-4 py-2.5 text-small font-strong text-text-error"
				state={state}
			>
				{(state) => {
					if (state.status !== "error") {
						return null;
					}

					return (
						<span className="flex items-center gap-x-2">
							<AlertTriangle aria-hidden={true} className="size-6 shrink-0 text-icon-error" />
							{state.message}
						</span>
					);
				}}
			</FormErrorMessage>
			<FormSuccessMessage
				className="min-h-12 rounded-2 border border-stroke-success-weak bg-fill-success-weak px-4 py-2.5 text-small font-strong text-text-success"
				state={state}
			>
				{(state) => {
					if (state.status !== "success") {
						return null;
					}

					return (
						<span className="flex items-center gap-x-2">
							<CheckCircle2Icon aria-hidden={true} className="size-6 shrink-0 text-icon-success" />
							{state.message}
						</span>
					);
				}}
			</FormSuccessMessage>
		</Fragment>
	);
}
