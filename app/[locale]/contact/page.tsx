import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ContactForm } from "@/app/[locale]/contact/_components/contact-form";
import { MainContent } from "@/components/ui/main-content";
import type { IntlLocale } from "@/lib/i18n/locales";

interface ContactPageProps {
	params: Promise<{
		locale: IntlLocale;
	}>;
}

export async function generateMetadata(
	props: Readonly<ContactPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = await params;

	const t = await getTranslations({ locale, namespace: "ContactPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function ContactPage(props: Readonly<ContactPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = await params;

	setRequestLocale(locale);

	const t = await getTranslations("ContactPage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="relative layout-subgrid bg-fill-weaker py-16 xs:py-20">
				<div className="grid max-w-text gap-y-4">
					<h1 className="font-heading text-heading-1 font-strong text-balance text-text-strong">
						{t("title")}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">{t("message")}</p>
				</div>
			</section>

			<section className="relative layout-subgrid content-max-w-text border-t border-stroke-weak py-16 xs:py-20">
				<ContactForm />
			</section>
		</MainContent>
	);
}
