"use client";

import { createContext, use } from "react";

interface FieldContextValue {
	isRequired: boolean;
}

export const FieldStatusContext = createContext<FieldContextValue | null>(null);

export function useFieldStatus() {
	const value = use(FieldStatusContext);

	return value;
}
