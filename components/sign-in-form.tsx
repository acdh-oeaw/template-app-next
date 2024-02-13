import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SignInFormComponent } from "@/components/sign-in-form-component";

interface SignInFormProps {
	callbackUrl?: string | undefined;
}

export function SignInForm(props: SignInFormProps): ReactNode {
	const { callbackUrl } = props;

	const t = useTranslations("SignInForm");

	return (
		<SignInFormComponent
			callbackUrl={callbackUrl}
			emailLabel={t("email")}
			passwordLabel={t("password")}
			signInLabel={t("sign-in")}
		/>
	);
}
