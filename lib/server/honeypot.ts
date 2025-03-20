import { HoneypotError } from "@/lib/server/errors";

export const fieldName = "phone-number";

export function assertValidFormSubmission(formData: FormData): void {
	if (formData.get(fieldName) !== "") {
		throw new HoneypotError();
	}
}
