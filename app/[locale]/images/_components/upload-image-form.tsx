"use client";

import { cn } from "@acdh-oeaw/style-variants";
import type { ReactNode } from "react";
import { useFormState } from "react-dom";

import { createImageAction } from "@/app/[locale]/images/_actions/create-image-action";
import { Form } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { FormStatus } from "@/components/ui/form-status";
import { createInitialActionState, getFieldErrors } from "@/lib/server/actions";

export function UploadImageForm(): ReactNode {
	const [state, action] = useFormState(createImageAction, createInitialActionState({}));

	return (
		<Form action={action} className="grid gap-y-8" validationErrors={getFieldErrors(state)}>
			<FormStatus state={state} />

			<label>
				<div>Select an image to upload</div>
				<input accept="image/png, image/jpeg" name="file" required={true} type="file" />
			</label>

			<div>
				<SubmitButton
					className={cn(
						"inline-flex min-h-12 items-center rounded-2 border border-stroke-brand-strong bg-fill-brand-strong px-5 py-2.5 text-small font-strong text-text-inverse-strong shadow-raised",
						"interactive focus-visible:focus-outline hover:hover-overlay pressed:press-overlay",
					)}
				>
					Upload image
				</SubmitButton>
			</div>
		</Form>
	);
}
