import type { useRouter } from "@/lib/navigation/navigation";

/** @see https://react-spectrum.adobe.com/react-aria/routing.html#router-options */
declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}
