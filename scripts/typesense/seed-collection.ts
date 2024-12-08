import { assert, createUrl, createUrlSearchParams, log, request } from "@acdh-oeaw/lib";
import { faker } from "@faker-js/faker";
import { Client } from "typesense";

import { env } from "@/config/env.config";
import { collection, type CollectionDocument } from "@/lib/typesense/collection";

faker.seed(123);
faker.setDefaultRefDate(new Date(Date.UTC(2025, 0, 1)));

async function seed() {
	const apiKey = env.TYPESENSE_ADMIN_API_KEY;
	assert(apiKey, "Missing `TYPESENSE_ADMIN_API_KEY` environment variable.");

	const client = new Client({
		apiKey,
		connectionTimeoutSeconds: 3,
		nodes: [
			{
				host: env.NEXT_PUBLIC_TYPESENSE_HOST,
				port: env.NEXT_PUBLIC_TYPESENSE_PORT,
				protocol: env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
			},
		],
	});

	// FIXME: @see https://github.com/typesense/typesense/pull/2218
	await client.collections(collection.name).documents().delete({ truncate: true });

	async function getBooks() {
		const url = createUrl({
			baseUrl: "https://openlibrary.org",
			pathname: "/subjects/science_fiction.json",
			searchParams: createUrlSearchParams({ limit: 1_000 }),
		});

		const response = (await request(url, { responseType: "json" })) as {
			works: Array<{
				title: string;
				authors?: Array<{ name: string }>;
				first_publish_year?: number;
			}>;
		};

		return response.works.map((book) => {
			const document: CollectionDocument = {
				id: faker.string.uuid(),
				title: book.title,
				authors:
					book.authors?.map((author) => {
						return author.name;
					}) ?? [],
				"publication-date": book.first_publish_year
					? new Date(book.first_publish_year).getTime()
					: faker.date.past({ years: 50 }).getTime(),
				description: faker.lorem.paragraphs(2),
				genres: faker.helpers.multiple(
					() => {
						return faker.book.genre();
					},
					{ count: { min: 1, max: 4 } },
				),
			};

			return document;
		});
	}

	const documents = await getBooks();

	await client.collections(collection.name).documents().import(documents);
}

seed()
	.then(() => {
		log.success(`Successfully seeded collection "${collection.name}".`);
	})
	.catch((error: unknown) => {
		log.error(`Failed to seed collection "${collection.name}".\n`, String(error));
		process.exitCode = 1;
	});
