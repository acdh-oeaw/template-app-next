/* eslint-disable react/jsx-no-literals */

import { DownloadIcon } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { MainContent } from "@/components/ui/main-content";
import type { Locale } from "@/config/i18n.config";

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
					<Button kind="primary" size="large" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="primary" size="large" tone="brand">
						Label
					</Button>
					<Button kind="primary" size="large" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="primary" size="large" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="primary" size="medium" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="primary" size="medium" tone="brand">
						Label
					</Button>
					<Button kind="primary" size="medium" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="primary" size="medium" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="primary" size="small" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="primary" size="small" tone="brand">
						Label
					</Button>
					<Button kind="primary" size="small" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="primary" size="small" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="secondary" size="large" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="secondary" size="large" tone="brand">
						Label
					</Button>
					<Button kind="secondary" size="large" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="secondary" size="large" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="secondary" size="medium" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="secondary" size="medium" tone="brand">
						Label
					</Button>
					<Button kind="secondary" size="medium" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="secondary" size="medium" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="secondary" size="small" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="secondary" size="small" tone="brand">
						Label
					</Button>
					<Button kind="secondary" size="small" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="secondary" size="small" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="tertiary" size="large" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="tertiary" size="large" tone="brand">
						Label
					</Button>
					<Button kind="tertiary" size="large" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="tertiary" size="large" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="tertiary" size="medium" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="tertiary" size="medium" tone="brand">
						Label
					</Button>
					<Button kind="tertiary" size="medium" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="tertiary" size="medium" tone="brand">
						Label
					</Button>
				</div>

				<div className="my-8 flex flex-wrap items-center gap-8">
					<Button kind="tertiary" size="small" tone="brand">
						Label
					</Button>
					<Button isDisabled={true} kind="tertiary" size="small" tone="brand">
						Label
					</Button>
					<Button kind="tertiary" size="small" tone="brand">
						<DownloadIcon aria-hidden={true} />
						Label
					</Button>
					<Button isPending={true} kind="tertiary" size="small" tone="brand">
						Label
					</Button>
				</div>
			</section>
		</MainContent>
	);
}
