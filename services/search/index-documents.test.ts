import { describe, expect, test } from "bun:test";

import type { TypesenseClient } from "#/lib/typesense/client.ts";
import { indexDocuments } from "#/services/search/index-documents.ts";

interface FakeServer {
	collections: Map<string, ReadonlyArray<{ id: string }>>;
	aliases: Map<string, string>;
}

function createFakeClient(server: FakeServer, overrides: Partial<TypesenseClient> = {}): TypesenseClient {
	return {
		createCollection: ({ name }) => {
			server.collections.set(name, []);
			return Promise.resolve();
		},
		deleteCollection: (name) => {
			server.collections.delete(name);
			return Promise.resolve();
		},
		listCollections: () => Promise.resolve(Array.from(server.collections.keys())),
		importDocuments: (name, documents) => {
			server.collections.set(name, documents);
			return Promise.resolve();
		},
		setAlias: (alias, collection) => {
			server.aliases.set(alias, collection);
			return Promise.resolve();
		},
		search: () => Promise.reject(new Error("Not implemented")),
		...overrides,
	};
}

function createFakeServer(collections: ReadonlyArray<string> = [], aliases: Array<[string, string]> = []): FakeServer {
	return { collections: new Map(collections.map((name) => [name, []])), aliases: new Map(aliases) };
}

const documents = [{ id: "1", title: "Vienna", body: "A city." }];

describe("indexDocuments", () => {
	test("switches the alias to a new collection", async () => {
		const server = createFakeServer();

		await indexDocuments(documents, { client: createFakeClient(server), collection: "app", now: 2 });

		expect(server.aliases.get("app")).toBe("app_2");
		expect(server.collections.get("app_2")).toStrictEqual(documents);
	});

	test("only deletes previous collections of the alias", async () => {
		const others = ["app-development_1", "app_3", "app_1_backup", "other_1"];
		const server = createFakeServer(["app_1", ...others], [["app", "app_1"]]);

		await indexDocuments(documents, { client: createFakeClient(server), collection: "app", now: 2 });

		expect(Array.from(server.collections.keys())).toStrictEqual([...others, "app_2"]);
	});

	test("keeps the previous collection when the import fails", async () => {
		const server = createFakeServer(["app_1"], [["app", "app_1"]]);
		const error = new Error("Import failed");
		const client = createFakeClient(server, { importDocuments: () => Promise.reject(error) });

		const reason: unknown = await indexDocuments(documents, { client, collection: "app", now: 2 }).catch(
			(error: unknown) => error,
		);

		expect(reason).toBe(error);
		expect(server.aliases.get("app")).toBe("app_1");
		expect(Array.from(server.collections.keys())).toStrictEqual(["app_1"]);
	});

	test("reports the import error when deleting the new collection fails as well", async () => {
		const error = new Error("Import failed");
		const client = createFakeClient(createFakeServer(), {
			importDocuments: () => Promise.reject(error),
			deleteCollection: () => Promise.reject(new Error("Delete failed")),
		});

		const reason: unknown = await indexDocuments(documents, { client, collection: "app", now: 2 }).catch(
			(error: unknown) => error,
		);

		expect(reason).toBe(error);
	});

	test("keeps both collections when it is unknown whether the alias was switched", async () => {
		const server = createFakeServer(["app_1"], [["app", "app_1"]]);
		const error = new Error("Request timed out");
		const client = createFakeClient(server, {
			setAlias: (alias, collection) => {
				server.aliases.set(alias, collection);
				return Promise.reject(error);
			},
		});

		const reason: unknown = await indexDocuments(documents, { client, collection: "app", now: 2 }).catch(
			(error: unknown) => error,
		);

		expect(reason).toBe(error);
		expect(Array.from(server.collections.keys())).toStrictEqual(["app_1", "app_2"]);
	});

	test("rejects a collection that hides the alias", async () => {
		const server = createFakeServer(["app"]);

		const reason: unknown = await indexDocuments(documents, {
			client: createFakeClient(server),
			collection: "app",
			now: 2,
		}).catch((error: unknown) => error);

		expect(reason).toBeInstanceOf(Error);
		expect(Array.from(server.collections.keys())).toStrictEqual(["app"]);
	});
});
