import * as v from "valibot";

export function base64ByteLength(...lengths: Array<number>): v.RawCheckAction<string> {
	return v.rawCheck(({ dataset, addIssue }) => {
		if (!dataset.typed || dataset.issues != null) {
			return;
		}

		if (!lengths.includes(atob(dataset.value).length)) {
			const expected = `${new Intl.ListFormat("en", { type: "disjunction" }).format(lengths.map(String))} bytes`;
			addIssue({ expected, message: `Invalid length: Expected ${expected}` });
		}
	});
}
