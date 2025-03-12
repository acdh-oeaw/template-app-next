"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useTransition } from "react";
import { Button } from "react-aria-components";

import { MainContent } from "@/components/ui/main-content";
import { useRouter } from "@/lib/i18n/navigation";

interface InternalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

/** `React.lazy` requires default export. */
// eslint-disable-next-line import-x/no-default-export
export default function InternalError(props: Readonly<InternalErrorProps>): ReactNode {
	const { error, reset } = props;

	const t = useTranslations("Error");

	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<MainContent className="layout-grid bg-fill-weaker">
			<section className="xs:py-24 grid place-content-center place-items-center gap-y-8 py-16">
				<h1 className="font-heading text-display font-strong text-text-strong text-balance text-center">
					{t("something-went-wrong")}
				</h1>
				<Button
					className="interactive rounded-2 border-stroke-brand-strong bg-fill-brand-strong text-tiny font-strong text-text-inverse-strong shadow-raised hover:hover-overlay focus-visible:focus-outline pressed:press-overlay inline-flex min-h-8 items-center border px-3 py-1"
					isPending={isPending}
					onPress={() => {
						startTransition(() => {
							router.refresh();
							reset();
						});
					}}
				>
					{t("try-again")}
				</Button>
			</section>
		</MainContent>
	);
}
