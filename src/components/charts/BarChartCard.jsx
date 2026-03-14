import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

function BarChartCard({orderData}) {

    return (
        <div className="mt-2 w-full sm:w-auto h-fit rounded-xl border bg-white shadow-xl sm:flex-1">
            <h3 className="px-3 py-2 text-lg font-semibold">Order Velocity</h3>

            {/* Bar chart */}
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderData} margin={{ top: 10, right: 30 }}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} interval="equidistantPreserveEnd" />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar
                            dataKey="orders"
                            fill="#1e3a8a"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default BarChartCard;