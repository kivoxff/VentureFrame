import RatingSummary from "./components/RatingSummary";
import UserReviews from "./components/UserReviews";

function ProductReviews() {

    const product = {
        reviews: 105,
        ratings: { 5: 20, 4: 50, 3: 10, 2: 20, 1: 5 }
    }

    return (
        <section className="mt-8 mx-auto px-4 sm:px-12 py-4 w-full max-w-7xl border">
            <h3 className="text-xl font-semibold">Reviews</h3>

            <RatingSummary />
            <UserReviews />
        </section>
    )
}

export default ProductReviews;