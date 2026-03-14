import DesktopScrollContainer from "../product-containers/DesktopScrollContainer";
import MobileScrollContainer from "../product-containers/MobileScrollContainer";
import { useSectionProducts } from "../../../../hooks/useSectionProducts";

const PRODUCTS_PER_PAGE = 9;

function DynamicSection({ section }) {
  const productIds = section.productIds || [];
  const {products, loadMore, hasMore} = useSectionProducts({productIds, PRODUCTS_PER_PAGE});

  return section.type === "M-Grid" ? (
    <DesktopScrollContainer
      title={section.title}
      products={products}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  ) : (
    <MobileScrollContainer
      title={section.title}
      products={products}
      loadMore={loadMore}
      hasMore={hasMore}
    />
  );
}

export default DynamicSection;
