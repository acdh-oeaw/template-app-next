import type { ElementRef } from "react";
import { mergeProps, useFocusRing, useHover, useLink } from "react-aria";

import { type ForwardedRef, forwardRef } from "@/lib/forward-ref";
import { LocaleLink, type LocaleLinkProps } from "@/lib/navigation";

export interface LinkProps extends LocaleLinkProps {}

/**
 * Duplicates most of the `Link` component from `react-aria-components`. Should be replaced
 * once that has support for Next.js prefetching.
 *
 * @see https://github.com/adobe/react-spectrum/issues/5476#issuecomment-1826203368
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/Link.tsx
 *
 */
export const Link = forwardRef(function Link(
	props: LinkProps,
	forwardedRef: ForwardedRef<ElementRef<typeof LocaleLink>>,
) {
	const { children, ...rest } = props;

	const { linkProps, isPressed } = useLink({ ...props, elementType: ElementType }, ref);

	const { hoverProps, isHovered } = useHover(props);
	const { focusProps, isFocused, isFocusVisible } = useFocusRing();

	const renderProps = useRenderProps({
		...props,
		values: {
			isCurrent: Boolean(props["aria-current"]),
			isDisabled: props.isDisabled || false,
			isPressed,
			isHovered,
			isFocused,
			isFocusVisible,
		},
	});

	return (
		<LocaleLink
			ref={forwardedRef}
			{...mergeProps(renderProps, linkProps, hoverProps, focusProps)}
			data-current={Boolean(props["aria-current"]) || undefined}
			data-disabled={props.isDisabled || undefined}
			data-focus-visible={isFocusVisible || undefined}
			data-focused={isFocused || undefined}
			data-hovered={isHovered || undefined}
			data-pressed={isPressed || undefined}
		>
			{renderProps.children}
		</LocaleLink>
	);
});
