import { createNavigation } from "next-intl/navigation";

import { routing } from "#/lib/i18n/routing.ts";
import { type Href, type RelativeHref, unsafeHref } from "#/lib/navigation/href.ts";

/**
 * Separate from `navigation.ts`, because without i18n routing these wrap the hooks of `next/navigation`, which cannot
 * be imported into a module that server components import.
 */
const navigation = createNavigation(routing);

type NextIntlRouter = ReturnType<typeof navigation.useRouter>;

type RouterOptions<TMethod extends "prefetch" | "push" | "replace"> = NonNullable<
	Parameters<NextIntlRouter[TMethod]>[1]
>;

/** Only pages can be localized, `next-intl` would prefix relative hrefs, like `/de#comments`. */
type RouterMethod<TMethod extends "prefetch" | "push" | "replace"> = ((
	href: RelativeHref,
	options?: Omit<RouterOptions<TMethod>, "locale">,
) => void) &
	((href: Href, options?: RouterOptions<TMethod>) => void);

interface Router extends Omit<NextIntlRouter, "prefetch" | "push" | "replace"> {
	prefetch: RouterMethod<"prefetch">;
	push: RouterMethod<"push">;
	replace: RouterMethod<"replace">;
}

/** Only narrows the types, so that navigating requires an href created with `href()`. */
export function useRouter(): Router {
	return navigation.useRouter();
}

/** The current pathname without the locale prefix, which is the href of the current page. */
export function usePathname(): Href {
	return unsafeHref(navigation.usePathname());
}
