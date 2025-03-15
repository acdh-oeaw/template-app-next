"use client";

import { XIcon } from "lucide-react";
import { type ComponentPropsWithRef, Fragment, type ReactNode } from "react";
import { composeRenderProps } from "react-aria-components";

import { IconButton } from "@/components/ui/icon-button";

interface CloseButtonProps extends ComponentPropsWithRef<typeof IconButton> {}

export function CloseButton(props: CloseButtonProps): ReactNode {
	const { children, ...rest } = props;

	return (
		<IconButton {...rest} slot="close">
			{composeRenderProps(children, (children) => {
				return (
					<Fragment>
						<XIcon aria-hidden={true} />
						{children}
					</Fragment>
				);
			})}
		</IconButton>
	);
}
