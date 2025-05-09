"use client";

import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { createHref } from "@/lib/navigation/create-href";

interface SkipLinkProps {
	children: ReactNode;
	id?: string;
	targetId: string;
}

export function SkipLink(props: Readonly<SkipLinkProps>): ReactNode {
	const { children, id, targetId } = props;

	/**
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=308064
	 */
	function onPress() {
		document.getElementById(targetId)?.focus();
	}

	return (
		<div className="fixed z-50 -translate-y-full px-2 py-3 focus-within:translate-y-0">
			<Link
				className="inline-flex rounded bg-background-inverse px-4 py-3 text-text-inverse-strong outline-transparent transition focus-visible:focus-outline"
				href={createHref({ hash: targetId })}
				id={id}
				onPress={onPress}
			>
				{children}
			</Link>
		</div>
	);
}
