import { Link } from "react-router-dom";
import sellerIcon from "../../../assets/icons/seller.svg";

const CategoryStrip = () => {
    const categories = [
        { name: "Men", img: sellerIcon },
        { name: "Women", img: sellerIcon },
        { name: "Kids", img: sellerIcon },
        { name: "Electronics", img: sellerIcon },
        { name: "Footwear", img: sellerIcon },
        { name: "Beauty", img: sellerIcon },
        { name: "Home", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
        { name: "Sports", img: sellerIcon },
    ];

    return (
        <section className="px-1 mt-2 w-full flex items-center justify-between gap-8 overflow-x-auto scrollbar-none border">
            {
                categories.map((category, idx) => (
                    <Link key={idx} className="group h-full flex flex-col items-center justify-center border transform hover:-translate-y-1 transition-transform duration-200">
                        <img src={category.img} alt="category" className="h-10 min-w-10 border" />
                        <span className="text-center font-semibold group-hover:text-orange-500 transition-colors duration-200">{category.name}</span>
                    </Link>
                ))
            }
        </section>
    )
}

export default CategoryStrip;