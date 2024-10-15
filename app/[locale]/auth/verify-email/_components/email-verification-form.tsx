import type { ReactNode } from "react";

import { Form } from "@/components/form";

export function EmailVerificationForm(): ReactNode {
	return (
		<Form action={verifyEmailAction}>
			<div className="my-8 grid max-w-96 content-start gap-y-6">
				<label className="grid gap-y-1.5">
					<span className="text-xs font-medium uppercase tracking-wide">{t("code")}</span>
					<input className="rounded border px-3 py-1" name="code" required={true} />
				</label>

				<div>
					<button
						className="inline-flex rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
						type="submit"
					>
						{t("verify")}
					</button>
				</div>
			</div>
		</Form>
	);
}
