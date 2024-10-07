import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { signUpAction } from "@/app/[locale]/auth/sign-up/_actions/sign-up-action";
import { Form } from "@/components/form";
import { Link } from "@/components/link";

export function SignUpForm(): ReactNode {
	const t = useTranslations("SignUpForm");

	return (
		<Form action={signUpAction}>
			<div className="my-8 grid max-w-96 content-start gap-y-6">
				<label className="grid gap-y-1.5">
					<span className="text-xs font-medium uppercase tracking-wide">{t("email")}</span>
					<input className="rounded border px-3 py-1" name="email" required={true} type="email" />
				</label>

				<label className="grid gap-y-1.5">
					<span className="text-xs font-medium uppercase tracking-wide">{t("password")}</span>
					<input
						className="rounded border px-3 py-1"
						name="password"
						required={true}
						type="password"
					/>
				</label>

				<div>
					<button
						className="inline-flex rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
						type="submit"
					>
						{t("sign-up")}
					</button>
				</div>

				<div>
					<span>{t("has-account")} </span>
					<Link href="/auth/sign-up">{t("sign-in")}</Link>
				</div>
			</div>
		</Form>
	);
}
