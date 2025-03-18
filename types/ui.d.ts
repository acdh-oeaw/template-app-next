import type { useRouter } from "@/lib/navigation/navigation";

declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}
