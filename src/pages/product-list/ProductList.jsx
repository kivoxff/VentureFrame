import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import AppLayout from "../../components/layout/AppLayout";
import FilterStrip from "./components/FilterStrip";
import FilteredProducts from "./components/FilteredProducts";
import SearchResultHeader from "./components/SearchResultHeader";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX;

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY,
);

function ProductList() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHits, setTotalHits] = useState(0);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // STATE FOR DYNAMIC FACETS (For FilterStrip)
  const [facets, setFacets] = useState({});
  const [facetStats, setFacetStats] = useState({});

  const searchQuery = searchParams.get("query") || "";
  const paramsString = searchParams.toString();

  const filterBuilder = (params) => {
    const andParts = [];

    if (params.minPrice) andParts.push(`price >= ${params.minPrice}`);
    if (params.maxPrice) andParts.push(`price <= ${params.maxPrice}`);

    Object.entries(params).forEach(([key, values]) => {
      // You MUST ignore "query" here so it doesn't become a filter!
      if (["minPrice", "maxPrice", "query"].includes(key) || !values) return;

      const orParts = `(${values
        .split(",")
        .map((value) => `${key}: "${value}"`)
        .join(" OR ")})`; // (brand: apple OR brand: nike OR brand: samsung)

      andParts.push(orParts);
    });

    return andParts.join(" AND ");
    // price >= 500 AND price <= 1000 AND (brand: apple OR brand: nike OR brand: samsung) AND (category: mobile OR category: laptop) ...
  };

  const transformProduct = (hit) => ({
    name: hit.title,
    id: hit.productId,
    seller: hit.storeName,
    salePrice: hit.price,
    mrp: hit.originalPrice,
    thumbnails: hit.images,
    company: hit.brand,
    variants: hit.options,
    highlights: hit.features,
    type: hit.category,
    details: hit.description,
    attributes: hit.specs,
  });

  // Load More
  const loadMore = () => setPage((prev) => prev + 1);

  // Reset page to 0 if the URL search params change
  useEffect(() => {
    setPage(0);
  }, [paramsString]);

  // SEARCH FUNCTION
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);

      try {
        const paramsObj = Object.fromEntries(searchParams.entries());
        const filterString = filterBuilder(paramsObj);

        // Send TWO requests in one call
        const response = await searchClient.search({
          requests: [
            // The Product Request (Has filters)
            {
              indexName: INDEX_NAME,
              query: searchQuery,
              filters: filterString || undefined,
              page: page,
              hitsPerPage: 2,
            },
            // The Facet Request (NO filters, just gets the full list of options)
            {
              indexName: INDEX_NAME,
              query: searchQuery,
              facets: ["category", "brand", "price"], // stockStatus can also be added
              hitsPerPage: 0, // We only want the facets here, no products!
            },
          ],
        });

        // RETRIEVE
        const productResult = response.results[0]; // Filtered products
        const facetResult = response.results[1]; // Unfiltered facets

        console.log(productResult, facetResult);

        setFacets(facetResult.facets || {});
        setFacetStats(facetResult.facets_stats || {});

        // Calculate the total items we will have on screen after this fetch
        const totalLoaded =
          page === 0
            ? productResult.hits.length
            : products.length + productResult.hits.length;

        setHasMore(totalLoaded < productResult.nbHits);

        const transformedHits = productResult.hits.map(transformProduct);

        if (page === 0) {
          setProducts(transformedHits);
        } else {
          setProducts((prev) => [...prev, ...transformedHits]);
        }

        setTotalHits(productResult.nbHits);
      } catch (err) {
        console.error("Algolia search error:", err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [paramsString, page]); // Trigger fetch on URL change OR page change

  return (
    <AppLayout>
      <FloatingNavButtons />
      <FilterStrip
        facets={facets}
        facetStats={facetStats}
        // disabled={loading}
      />
      <SearchResultHeader searchQuery={searchQuery} />
      <FilteredProducts
        products={products}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </AppLayout>
  );
}

export default ProductList;
