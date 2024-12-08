export const cacheSearchResultsForSeconds = 60 * 60;

export const defaultLimit = 25;

/**
 * Intentionally high value to reduce the risk of selected facet values not being
 * included in the api response.
 *
 * @see https://github.com/typesense/typesense/issues/2131
 */
export const maxFacetValues = 250;

export const defaultVisibleFacetValues = 10;

export const maxVisibleFacetValues = 25;
