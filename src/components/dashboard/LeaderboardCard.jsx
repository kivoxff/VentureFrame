import { Link } from "react-router-dom"

function LeaderboardCard({ leaderboardData, title, redirectTo }) {
    return (
        <div className="mt-2 h-fit rounded-xl border bg-white shadow-xl grow">
            <div className="px-3 py-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Top {title} 🏆</h3>
                <Link to={redirectTo} className="text-sm text-blue-600 hover:underline">Manage {title}</Link>
            </div>

            {/* sellers */}
            <div>
                {
                    leaderboardData.map((item) => (
                        <div className="px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="w-8 aspect-square bg-gray-200 inline-flex items-center justify-center rounded-full">{item.rank}</span>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{item.name}</span>
                                    <span className="text-xs text-gray-400">{item.sales} Sales</span>
                                </div>
                            </div>
                            <span className="font-semibold">{item.revenue}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default LeaderboardCard;