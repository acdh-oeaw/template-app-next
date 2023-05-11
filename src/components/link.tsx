import Link from "next-intl/link";
import { type ComponentPropsWithoutRef } from "react";

type _LinkProps = ComponentPropsWithoutRef<typeof Link>;

type Href = Exclude<_LinkProps["href"], string>;

export interface LinkProps extends Omit<_LinkProps, "href"> {
	href: Href;
}

export { Link };
