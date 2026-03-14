import SectionManager from "./components/SectionManager";
import BannerManager from "./components/BannerManager";
import CategoryManager from "./components/CategoryManager";
import PromoCodeManager from "./components/PromoCodeManager";


function StoreManager() {

    return (
        <section className="space-y-6">
            <PromoCodeManager />
            
            <div className="flex flex-col sm:flex-row gap-4">
                <CategoryManager />
                <BannerManager />
            </div>

            <SectionManager />
        </section>
    )
}

export default StoreManager;