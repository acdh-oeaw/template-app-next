"use client";

import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";
import { composeRenderProps } from "react-aria-components";

import { Button } from "@/components/ui/button";

interface IconButtonProps extends Omit<ComponentPropsWithRef<typeof Button>, "variant"> {
	label: ReactNode;
}

export function IconButton(props: IconButtonProps): ReactNode {
	const { children, label, ...rest } = props;

	return (
		<Button {...rest} variant="icon-only">
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						{children}
						<span className="sr-only">{label}</span>
					</Fragment>
				);
			})}
		</Button>
	);
}
