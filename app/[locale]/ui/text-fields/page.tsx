/* eslint-disable react/jsx-no-literals */

import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field-description";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainContent } from "@/components/ui/main-content";
import { TextField } from "@/components/ui/text-field";
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
					<TextField>
						<Label>Your name</Label>
						<Input />
					</TextField>

					<TextField>
						<div>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</div>
						<Input />
					</TextField>

					<TextField isDisabled={true} isRequired={true}>
						<div>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</div>
						<FieldError />
						<Input />
					</TextField>
				</div>

				<form className="my-8 grid gap-y-8">
					<TextField isRequired={true}>
						<div>
							<Label>Your name</Label>
							<FieldDescription>
								Some help text to help you understand what this form field does
							</FieldDescription>
						</div>
						<FieldError />
						<Input />
					</TextField>

					<TextField isRequired={true}>
						<Label>Your name</Label>
						<FieldError />
						<Input />
					</TextField>

					<Button type="submit">Submit</Button>
				</form>
			</section>
		</MainContent>
	);
}
