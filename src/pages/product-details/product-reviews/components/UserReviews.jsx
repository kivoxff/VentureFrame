function UserReviews() {
    const reviews = [
        {
            id: 1,
            name: "Rahul Sharma",
            rating: 5,
            date: "2 days ago",
            comment:
                "Amazing camera quality! The 200MP sensor is truly impressive. Battery easily lasts a full day with heavy usage.",
        },
        {
            id: 2,
            name: "Ananya Verma",
            rating: 4,
            date: "1 week ago",
            comment:
                "Display is beautiful and smooth. Phone feels premium in hand, but charging speed could be better.",
        },
        {
            id: 3,
            name: "Amit Patel",
            rating: 5,
            date: "2 weeks ago",
            comment:
                "Best Android phone I've used so far. Performance is blazing fast and S-Pen is very useful.",
        },
    ];

    return (
        <div className="space-y-8">
            {
                reviews.slice(0, 3).map((review) => (
                    <div className="mt-4 w-full">
                        <div className="w-full flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{review.name}</p>
                                <span className="text-yellow-500">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                </span>
                            </div>
                            <span className="text-sm text-gray-400">{review.date}</span>
                        </div>

                        {/* Comment */}
                        <p className="mt-2 text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default UserReviews;
