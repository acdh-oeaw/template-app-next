import { createNavigation } from "next-intl/navigation";

import { routing } from "#/lib/i18n/routing.ts";

export const { getPathname, Link, permanentRedirect, redirect, usePathname, useRouter } = createNavigation(routing);
