import { ForbiddenError } from "@/lib/server/errors";

// eslint-disable-next-line @typescript-eslint/require-await
export async function assertImageServicePermissions(): Promise<void> {
	/**
	 * The image service needs to be authenticated, since we neither want public read/write access to
	 * the object store (`s3` bucket), nor public usage of the `imgproxy` image optimisation service.
	 *
	 * When integrating the image service with `keystatic` you need to expose the service via api
	 * routes, and use the github access token provided by `keystatic` in the `keystatic-gh-access-token`
	 * cookie to authorize that a user via github api.
	 *
	 * @example https://github.com/acdh-oeaw/template-app-next/tree/example/with-keystatic-image-service
	 */
	throw new ForbiddenError();
}
