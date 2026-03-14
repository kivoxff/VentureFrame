import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

function AraaChartCard({RevenueData}) {

    return (
        <div className="mt-2 w-full sm:w-auto h-fit rounded-xl border bg-white shadow-xl sm:flex-1">
            <div className="px-3 py-2 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Revenue Stream</h3>
                <div className="text-sm text-red-600 font-semibold inline-flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <span>Live</span>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RevenueData} margin={{ top: 10, right: 30 }}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} interval="equidistantPreserveEnd" />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area
                            dataKey="revenue"
                            strokeWidth={4}
                            stroke="#0f766e"
                            fill="rgba(136, 132, 216, 0.1)"
                            type="monotone"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AraaChartCard;