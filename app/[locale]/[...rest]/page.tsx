import { notFound } from "next/navigation";

/** Always renders the not-found page, so there is nothing to validate. */
export const instant = false;

/** Next.js only reads the metadata from `not-found.tsx` when `generateMetadata` throws, not when the page does. */
export function generateMetadata(): never {
	notFound();
}

/** Renders the localized `not-found.tsx` for unmatched routes. Invalid locales are rewritten here in `next.config.ts`. */
export default function CatchAllPage(): never {
	notFound();
}
