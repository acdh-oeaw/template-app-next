"use client";

import { createContext, use } from "react";

interface FieldContextValue {
	isDisabled: boolean;
	isInvalid: boolean;
	/**
	 * Currently not supported by all field components.
	 *
	 * @see https://github.com/adobe/react-spectrum/issues/6151
	 */
	// isReadOnly: boolean;
	isRequired: boolean;
}

export const FieldStatusContext = createContext<FieldContextValue | null>(null);

export function useFieldStatus(): FieldContextValue | null {
	const value = use(FieldStatusContext);

	return value;
}
