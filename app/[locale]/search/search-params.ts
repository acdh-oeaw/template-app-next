import * as v from "valibot";

import { createSearchParamsCodec, searchParam } from "#/lib/navigation/search-params.ts";

export const searchParamsCodec = createSearchParamsCodec({
	q: searchParam.string(v.pipe(v.string(), v.trim())),
	page: searchParam.number(v.pipe(v.number(), v.integer(), v.minValue(1)), { default: 1 }),
});
