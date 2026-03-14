function StatCard({statsData}) {

    return (
        <div className="flex flex-wrap gap-4 justify-center sm:justify-between">
            {statsData.map((stat, idx) => (
                <div key={stat.id} className="w-full p-5 border rounded-2xl shadow-xl bg-white sm:basis-[48%] xl:basis-[23%]">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h3 className="text-sm text-gray-600 font-semibold">
                                {stat.title}
                            </h3>
                            <span className={`text-3xl font-bold ${idx === 0 ? "text-rose-500" : "text-blue-500"}`}>{stat.value}</span>
                        </div>

                        <div className="w-14 aspect-square rounded-xl flex items-center justify-center bg-gray-200 text-2xl">
                            {stat.icon}
                        </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                        <span className={`font-medium ${stat.changeType === "up" ? "text-green-700" : "text-red-600"}`}>
                            {stat.change}
                        </span>{" "}
                        {stat.note}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default StatCard;