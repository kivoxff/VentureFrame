function TrustBadges() {
    const badges = [
        {
            id: 1,
            title: "100% Secure Payment",
            description: "Shop with confidence – your payment information is completely safe.",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        },
        {
            id: 2,
            title: "Fast Delivery",
            description: "Get your orders quickly with our reliable and timely shipping service.",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        },
        {
            id: 3,
            title: "Easy Returns",
            description: "Hassle-free returns within 30 days – shop worry-free every time.",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        },
        {
            id: 4,
            title: "24/7 Customer Support",
            description: "We’re here to help you anytime – chat, call, or email us 24/7.",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        },
    ];


    return (
        <section className="mx-auto mt-2 px-4 sm:px-12 w-full max-w-7xl border">
            <div className="py-8 w-full flex flex-wrap sm:flex-nowrap justify-around gap-4">
                {
                    badges.map((badge) => (
                        <div key={badge.id} className="p-4 min-w-32 w-2/5 sm:w-1/5 flex flex-col items-center gap-2">
                            <img src={badge.img} alt="badgeImg" className="p-2 w-20 aspect-square object-cover border border-gray-300 rounded-full" />
                            <h3 className="text-sm font-semibold text-center">{badge.title}</h3>
                            <p className="text-xs text-center text-gray-500">{badge.description}</p>
                        </div>
                    ))
                }
            </div>
        </section>
    )
}

export default TrustBadges;