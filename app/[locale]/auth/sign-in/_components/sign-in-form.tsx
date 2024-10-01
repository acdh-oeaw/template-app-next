import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Form } from "@/components/form";
import { Link } from "@/components/link";
import { signInAction } from "@/lib/auth/sign-in-action";

export function SignInForm(): ReactNode {
	const t = useTranslations("SignInForm");

	return (
		<Form action={signInAction}>
			<div className="my-8 grid max-w-96 content-start gap-y-6">
				<label className="grid gap-y-1.5">
					<span className="text-xs font-medium uppercase tracking-wide">{t("username")}</span>
					<input className="rounded border px-3 py-1" name="username" required={true} />
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
						{t("sign-in")}
					</button>
				</div>

				<div>
					<Link href="/auth/sign-up">{t("sign-up")}</Link>
				</div>
			</div>
		</Form>
	);
}
