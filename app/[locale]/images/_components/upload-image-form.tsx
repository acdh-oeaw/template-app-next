"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";

import { Form } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";

export function UploadImageForm(): ReactNode {
	return (
		<Form
			action="/api/images/upload"
			className="grid justify-items-start gap-y-6"
			encType="multipart/form-data"
			method="post"
		>
			<label>
				<div>Select an image to upload</div>
				<input accept="image/png, image/jpeg" name="file" required={true} type="file" />
			</label>

			<SubmitButton
				className={cn(
					"inline-flex min-h-8 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-3 py-1 text-tiny font-strong text-text-inverse-strong shadow-raised",
					"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
				)}
			>
				Upload
			</SubmitButton>
		</Form>
	);
}
