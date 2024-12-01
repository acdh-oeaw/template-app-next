import "server-only";

import { createReaders } from "@acdh-oeaw/keystatic-lib/reader";
import { assert, keyByToMap } from "@acdh-oeaw/lib";
import { cache } from "react";

import config from "@/config/keystatic.config";
import { compileMdx } from "@/lib/content/compile-mdx";
import { getIntlLanguage, type IntlLocale } from "@/lib/i18n/locales";

const {
	createCollectionResource: _createCollectionResource,
	createSingletonResource: _createSingletonResource,
} = createReaders(config, compileMdx);

const createCollectionResource = cache(_createCollectionResource);
const createSingletonResource = cache(_createSingletonResource);

export const createClient = cache(async function createClient(locale: IntlLocale) {
	const language = getIntlLanguage(locale);

	const _people = await createCollectionResource("people", language).all();
	const _peopleById = byId(_people);

	const documentation = {
		async all() {
			return createCollectionResource("documentation", language).all();
		},

		async ids() {
			return createCollectionResource("documentation", language).list();
		},

		async get(id: string) {
			const page = await createCollectionResource("documentation", language).read(id);
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
			return createCollectionResource("people", language).list();
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
			return createSingletonResource("metadata", language).read();
		},
	};

	const navigation = {
		async get() {
			return createSingletonResource("navigation", language).read();
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
