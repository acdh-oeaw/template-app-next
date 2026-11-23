import type { Metadata } from "next";
import { useExtracted as useTranslations } from "next-intl";
import { getExtracted as getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ContactForm } from "#/app/[locale]/contact/contact-form.tsx";
import { MainContent } from "#/components/main-content.tsx";
import { createPageMetadata } from "#/lib/metadata/create-page-metadata.ts";
import { href } from "#/lib/navigation/href.ts";

interface ContactPageProps extends PageProps<"/[locale]/contact"> {}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return createPageMetadata({ href: href({ pathname: "/contact" }), title: t("Contact") });
}

export default function ContactPage(_props: Readonly<ContactPageProps>): ReactNode {
	const t = useTranslations();

	return (
		<MainContent>
			<h1>{t("Contact")}</h1>
			<ContactForm />
		</MainContent>
	);
}
