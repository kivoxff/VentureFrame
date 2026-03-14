import FloatingNavButtons from "../../components/ui/misc/FloatingNavButtons";
import AppLayout from "../../components/layout/AppLayout";
import SectionTitle from "../../components/ui/misc/SectionTitle";
import FilterStrip from "./components/FilterStrip";
import FilteredProducts from "./components/FilteredProducts";

function ProductList() {
    return (
        <AppLayout>
            <FloatingNavButtons />
            <FilterStrip />
            <SectionTitle title={"Results for Amuk Amuk"} />
            <FilteredProducts />
        </AppLayout>
    )
}

export default ProductList;