import { includes } from "@acdh-oeaw/lib";
import type { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

interface SchemaField extends Pick<CollectionFieldSchema, "name" | "type" | "optional"> {}

interface CollectionConfig<TField extends SchemaField, TFieldName extends string = TField["name"]> {
	name: string;
	fields: Array<TField & { name: TFieldName }>;
	queryableFields: Array<TFieldName>;
	facetableFields: Array<TFieldName>;
	sortableFields: Array<TFieldName>;
}

interface Collection<
	TQueryField extends string,
	TFacetField extends string,
	TSortField extends string,
> {
	name: string;
	schema: CollectionCreateSchema;
	queryableFields: Array<TQueryField>;
	facetableFields: Array<TFacetField>;
	sortableFields: Array<TSortField>;
}

export function createCollection<
	TField extends SchemaField,
	TFieldName extends string = TField["name"],
	TQueryFields extends TFieldName = TFieldName,
	TFacetFields extends TFieldName = TFieldName,
	TSortFields extends TFieldName = TFieldName,
>(
	config: CollectionConfig<TField, TFieldName> & {
		queryableFields: Array<TQueryFields>;
		facetableFields: Array<TFacetFields>;
		sortableFields: Array<TSortFields>;
	},
): Collection<TQueryFields, TFacetFields, TSortFields> {
	const { name, fields, queryableFields, facetableFields, sortableFields } = config;

	const schema: CollectionCreateSchema = {
		name,
		fields: fields.map((field) => {
			return {
				name: field.name,
				type: field.type,
				optional: field.optional ?? false,
				facet: includes(facetableFields, field.name),
				sort: includes(sortableFields, field.name),
			};
		}),
	};

	return {
		name,
		schema,
		queryableFields,
		facetableFields,
		sortableFields,
	};
}
