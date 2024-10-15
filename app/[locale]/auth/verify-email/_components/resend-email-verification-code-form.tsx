import type { ReactNode } from "react";

import { Form } from "@/components/form";

export function ResendEmailVerificationCodeForm(): ReactNode {
	return (
		<Form action={resendEmailVerificationCodeAction}>
			<div className="my-8 grid max-w-96 content-start gap-y-6">
				<div>
					<button
						className="inline-flex rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
						type="submit"
					>
						{t("resend-code")}
					</button>
				</div>
			</div>
		</Form>
	);
}
