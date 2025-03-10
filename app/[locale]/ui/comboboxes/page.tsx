/* eslint-disable react/jsx-no-literals */

import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ComboBox, ComboBoxTrigger } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListBox, ListBoxItem } from "@/components/ui/listbox";
import { MainContent } from "@/components/ui/main-content";
import { Popover } from "@/components/ui/popover";
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

	const items = [
		{ id: "one", label: "One" },
		{ id: "two", label: "Two" },
		{ id: "three", label: "Three" },
	];

	return (
		<MainContent className="layout-grid content-start">
			<section className="relative layout-subgrid bg-fill-weaker py-16 xs:py-24">
				<h1>ComboBoxes</h1>

				<form className="my-8 grid gap-8">
					<ComboBox isRequired={true}>
						<Label>Fruits</Label>

						<ComboBoxTrigger>
							<Input />
						</ComboBoxTrigger>

						<Popover>
							<ListBox>
								{items.map((item) => {
									return (
										<ListBoxItem key={item.id} textValue={item.label}>
											{item.label}
										</ListBoxItem>
									);
								})}
							</ListBox>
						</Popover>
					</ComboBox>

					<Button type="submit">Submit</Button>
				</form>
			</section>
		</MainContent>
	);
}
