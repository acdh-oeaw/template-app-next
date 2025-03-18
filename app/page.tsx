import { defaultLocale } from "@/lib/i18n/locales";
import { redirect } from "@/lib/navigation/navigation";

/**
 * This page only renders when the app is built statically with `output: "export"`.
 */
export default function RootPage(): void {
	redirect({ href: "/", locale: defaultLocale });
}
