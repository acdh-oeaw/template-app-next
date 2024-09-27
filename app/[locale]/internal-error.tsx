"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useTransition } from "react";

import { MainContent } from "@/components/main-content";
import { PageTitle } from "@/components/ui/page-title";
import { useRouter } from "@/lib/navigation";

interface InternalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/** `React.lazy` requires default export. */
export default function InternalError(props: InternalErrorProps): ReactNode {
	const { error, reset } = props;

	const t = useTranslations("Error");

	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<MainContent className="container py-8">
			<PageTitle>{t("something-went-wrong")}</PageTitle>
			<button
				disabled={isPending}
				onClick={() => {
					startTransition(() => {
						router.refresh();
						reset();
					});
				}}
				type="button"
			>
				{t("try-again")}
			</button>
		</MainContent>
	);
}
