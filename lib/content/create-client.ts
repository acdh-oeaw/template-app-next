import "server-only";

import { createReaders } from "@acdh-oeaw/keystatic-lib/reader";
import { assert, keyByToMap } from "@acdh-oeaw/lib";
import { cache } from "react";

import type { Locale } from "@/config/i18n.config";
import config from "@/keystatic.config";
import { compileMdx } from "@/lib/content/compile-mdx";

const {
	createCollectionResource: _createCollectionResource,
	createSingletonResource: _createSingletonResource,
} = createReaders(config, compileMdx);

const createCollectionResource = cache(_createCollectionResource);
const createSingletonResource = cache(_createSingletonResource);

export const createClient = cache(async function createClient(locale: Locale) {
	const _people = await createCollectionResource("people", locale).all();
	const _peopleById = byId(_people);

	const documentation = {
		async all() {
			return createCollectionResource("documentation", locale).all();
		},

		async ids() {
			return createCollectionResource("documentation", locale).list();
		},

		async get(id: string) {
			const page = await createCollectionResource("documentation", locale).read(id);
			const authors = page.data.authors.map((id) => {
				const person = _peopleById.get(id);
				assert(person, `Missing person "${id}".`);
				return person;
			});
			return { ...page, data: { ...page.data, authors } };
		},
	};

	const people = {
		// eslint-disable-next-line @typescript-eslint/require-await
		async all() {
			return _people;
		},

		async ids() {
			return createCollectionResource("people", locale).list();
		},

		// eslint-disable-next-line @typescript-eslint/require-await
		async get(id: string) {
			const person = _peopleById.get(id);
			assert(person, `Missing person "${id}".`);
			return person;
		},
	};

	const metadata = {
		async get() {
			return createSingletonResource("metadata", locale).read();
		},
	};

	const navigation = {
		async get() {
			return createSingletonResource("navigation", locale).read();
		},
	};

	return {
		documentation,
		people,
		metadata,
		navigation,
	};
});

function byId<T extends { id: string }>(items: Array<T>) {
	return keyByToMap(items, (item) => {
		return item.id;
	});
}
