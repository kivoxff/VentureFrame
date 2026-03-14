function RatingSummary() {

    const product = {
        reviews: 105,
        ratings: { 5: 20, 4: 50, 3: 10, 2: 20, 1: 5 }
    }

    return (
        <div className="mt-4 w-full flex flex-wrap sm:flex-nowrap justify-center items-center border">
            {/* Rating Summary */}
            <div className="w-40 sm:w-1/4 border flex flex-col justify-center items-center">
                <span className="text-4xl text-yellow-500 font-bold">4.5</span>
                <span className="font-semibold">Out of 5</span>
                <span className="text-gray-400 font-light">({product.reviews} ratings)</span>
            </div>

            {/* Rating Bars */}
            <div className="my-4 w-full border">
                {
                    [5, 4, 3, 2, 1].map((star) => (
                        <div className="w-full flex items-center">
                            <span className="w-10">{star}⭐</span>
                            <div className="mx-1 w-full h-3 bg-gray-200 rounded-full">
                                <div className={`w-[${Math.round((product.ratings[star] / product.reviews) * 100)}%] h-full bg-yellow-500 rounded-full`} />
                            </div>
                            <span className="w-8 text-right">{product.ratings[star]}</span>
                        </div>
                    ))

                }
            </div>
        </div>
    )
}

export default RatingSummary;