"use client";

import type { BasicFormField, FormFieldInputProps } from "@keystatic/core";
import { useState } from "react";

import { imageMimeTypes } from "@/config/images.config";

type ImageFieldInputProps = FormFieldInputProps<string>;

export function ImageFieldInput(
	props: ImageFieldInputProps,
): ReturnType<BasicFormField<string>["Input"]> {
	const {} = props;

	const [file, setFile] = useState<File | null>(null);

	return (
		<div>
			<label>
				<span>UPLOAD</span>
				<input
					accept={imageMimeTypes.join(", ")}
					onChange={(event) => {
						setFile(event.currentTarget.files?.[0] ?? null);
					}}
					type="file"
				/>
			</label>
			<button
				className="rounded-2 bg-black px-4 py-2 text-white"
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onClick={async () => {
					if (file == null) return;

					const formData = new FormData();
					formData.set("file", file);

					const response = await fetch("/api/images", { body: formData, method: "POST" });
					const data = (await response.json()) as { objectName: string };
					console.log({ data });
				}}
				type="button"
			>
				Click to upload
			</button>
			<pre>{JSON.stringify({ file }, null, 2)}</pre>
		</div>
	);
}
