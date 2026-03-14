import { useState } from "react";
import filter from "../../../assets/icons/filter.svg";

const FilterStrip = () => {
    const filters = [
        { name: "Men", options: ["T-Shirts", "Jeans", "Shoes"] },
        { name: "Women", options: ["Dresses", "Top", "Heels"] },
        { name: "Kids", options: ["Toys", "School", "Baby"] },
        { name: "Accessories", options: ["Watches", "Belts", "Bags"] },
        { name: "Beauty", options: ["Makeup", "Skin", "Hair"] },
        { name: "Home", options: ["Kitchen", "Decor", "Bedding"] },
    ];

    const [openFilter, setOpenFilter] = useState(null);

    return (
        <section className="mt-2 w-full border flex items-center">
            <div className="shrink-0 w-8 h-8 border">
                <img src={filter} alt="filter" className="w-full h-full object-cover" />
            </div>

            <div className="pb-60 -mb-60 w-full flex items-center  overflow-x-auto scrollbar-none">
                {
                    filters.map((filter) =>
                        <div key={filter.name} onMouseEnter={() => setOpenFilter(filter.name)} onMouseLeave={() => setOpenFilter(null)} className="group relative border">
                            <button onClick={() => setOpenFilter(openFilter === filter.name ? null : filter.name)} className="m-2 p-2 text-sm text-violet-900 font-semibold bg-blue-100 hover:bg-blue-200 rounded-full border">{filter.name}</button>
                            {
                                (openFilter === filter.name) && (
                                    <div className="p-2 w-56 max-h-40 absolute z-10 group-nth-last-2:right-0 group-last:right-0 flex-wrap bg-white border border-gray-200 rounded-xl shadow-lg">
                                        {
                                            filter.options.map((option) => <button key={option} className="border m-1 p-1 rounded-full text-xs font-semibold transition-all duration-150 hover:bg-violet-100 hover:text-violet-900 hover:border-violet-300">{option}</button>)
                                        }
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>

        </section>
    )
};

export default FilterStrip;
