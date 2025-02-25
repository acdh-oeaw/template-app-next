"use client";

import type { ReactNode } from "react";
import { Form as AriaForm, type FormProps as AriaFormProps } from "react-aria-components";

interface FormProps extends Omit<AriaFormProps, "encType" | "method" | "target"> {
	children: ReactNode;
}

export function Form(props: Readonly<FormProps>): ReactNode {
	const { children, ...rest } = props;

	return <AriaForm {...rest}>{children}</AriaForm>;
}
