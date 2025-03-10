/* eslint-disable react/jsx-no-literals */

import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field-description";
import { FieldError } from "@/components/ui/field-error";
import { FieldLabels } from "@/components/ui/field-labels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainContent } from "@/components/ui/main-content";
import { TextInput } from "@/components/ui/text-input";
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
				<h1>Text fields</h1>

				<div className="my-8 grid gap-y-8">
					<TextInput>
						<Label>Your name</Label>
						<Input />
					</TextInput>

					<TextInput>
						<FieldLabels>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</FieldLabels>
						<Input />
					</TextInput>

					<TextInput isDisabled={true} isRequired={true}>
						<FieldLabels>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</FieldLabels>
						<FieldError />
						<Input />
					</TextInput>
				</div>

				<form className="my-8 grid gap-y-8">
					<TextInput isRequired={true}>
						<FieldLabels>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</FieldLabels>
						<FieldError />
						<Input />
					</TextInput>

					<TextInput isRequired={true}>
						<FieldLabels>
							<Label>Your name</Label>
							<FieldError />
						</FieldLabels>
						<Input />
					</TextInput>

					<Button type="submit">Submit</Button>
				</form>
			</section>
		</MainContent>
	);
}
