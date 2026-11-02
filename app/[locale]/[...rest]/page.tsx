import { notFound } from "next/navigation";

/** Renders the localized `not-found.tsx` for unmatched routes, instead of `global-not-found.tsx`. */
export default function CatchAllPage(): never {
	notFound();
}
