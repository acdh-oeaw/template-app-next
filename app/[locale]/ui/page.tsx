import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { MainContent } from "@/components/ui/main-content";
import type { Locale } from "@/config/i18n.config";
import { DownloadIcon } from "lucide-react";

interface UiPageProps {
	params: Promise<{
		locale: Locale;
	}>;
}

export default async function UiPage(props: Readonly<UiPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	return (
		<MainContent className="layout-grid content-start">
			<section className="relative layout-subgrid bg-fill-weaker py-16 xs:py-24">
				<h1>Buttons</h1>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="large" kind="primary" tone="brand">
						Label
					</Button>
					<Button size="large" kind="primary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="large" kind="primary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="large" kind="primary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="medium" kind="primary" tone="brand">
						Label
					</Button>
					<Button size="medium" kind="primary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="medium" kind="primary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="medium" kind="primary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="small" kind="primary" tone="brand">
						Label
					</Button>
					<Button size="small" kind="primary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="small" kind="primary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="small" kind="primary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="large" kind="secondary" tone="brand">
						Label
					</Button>
					<Button size="large" kind="secondary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="large" kind="secondary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="large" kind="secondary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="medium" kind="secondary" tone="brand">
						Label
					</Button>
					<Button size="medium" kind="secondary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="medium" kind="secondary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="medium" kind="secondary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="small" kind="secondary" tone="brand">
						Label
					</Button>
					<Button size="small" kind="secondary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="small" kind="secondary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="small" kind="secondary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="large" kind="tertiary" tone="brand">
						Label
					</Button>
					<Button size="large" kind="tertiary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="large" kind="tertiary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="large" kind="tertiary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="medium" kind="tertiary" tone="brand">
						Label
					</Button>
					<Button size="medium" kind="tertiary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="medium" kind="tertiary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="medium" kind="tertiary" tone="brand" isPending>
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button size="small" kind="tertiary" tone="brand">
						Label
					</Button>
					<Button size="small" kind="tertiary" tone="brand" isDisabled>
						Label
					</Button>
					<Button size="small" kind="tertiary" tone="brand">
						<DownloadIcon aria-hidden data-slot="icon" />
						Label
					</Button>
					<Button size="small" kind="tertiary" tone="brand" isPending>
						Label
					</Button>
				</div>
			</section>
		</MainContent>
	);
}
