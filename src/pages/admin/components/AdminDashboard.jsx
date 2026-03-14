import BarChart from "../../../components/charts/BarChartCard";
import AraaChart from "../../../components/charts/AreaChartCard";
import StatCard from "../../../components/dashboard/StatCard";
import LeaderboardCard from "../../../components/dashboard/LeaderboardCard";
import RecentOrdersCard from "../../../components/dashboard/RecentOrderdsCard";

function AdminDashboard() {

  const statsData = [
    {
      id: 1,
      title: "Total Revenue",
      value: "₹9,999",
      icon: "💰",
      change: "+12.5%",
      changeType: "up",
      note: "from last month",
    },
    {
      id: 2,
      title: "Total Orders",
      value: "1,245",
      icon: "📦",
      change: "+8.2%",
      changeType: "up",
      note: "from last month",
    },
    {
      id: 3,
      title: "New Customers",
      value: "72",
      icon: "🆕",
      change: "+5.1%",
      changeType: "up",
      note: "this month",
    },
    {
      id: 4,
      title: "Pending Orders",
      value: "37",
      icon: "⏳",
      change: "-3.4%",
      changeType: "down",
      note: "from last week",
    },
  ];


  const monthlyRevenue = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 14000 },
    { month: "May", revenue: 20000 },
    { month: "Jun", revenue: 22000 },
    { month: "Jul", revenue: 19000 },
    { month: "Aug", revenue: 21000 },
    { month: "Sep", revenue: 23000 },
    { month: "Oct", revenue: 25000 },
    { month: "Nov", revenue: 24000 },
    { month: "Dec", revenue: 26000 }
  ];

  const orderVelocity = [
    { month: "Jan", orders: 920 },
    { month: "Feb", orders: 1050 },
    { month: "Mar", orders: 1180 },
    { month: "Apr", orders: 1120 },
    { month: "May", orders: 1300 },
    { month: "Jun", orders: 1420 },
    { month: "Jul", orders: 1500 },
    { month: "Aug", orders: 1580 },
    { month: "Sep", orders: 1620 },
    { month: "Oct", orders: 1750 },
    { month: "Nov", orders: 1900 },
    { month: "Dec", orders: 2100 }
  ];

  const orders = [
    {
      id: "ODR-001",
      customer: "Bob D.",
      status: "Pending",
      amount: "₹999",
      statusType: "processing",
    },
    {
      id: "ODR-002",
      customer: "Alice M.",
      status: "Completed",
      amount: "₹1,499",
      statusType: "completed",
    },
    {
      id: "ODR-003",
      customer: "Rahul S.",
      status: "Pending",
      amount: "₹799",
      statusType: "pending",
    },
    {
      id: "ODR-004",
      customer: "John K.",
      status: "Cancelled",
      amount: "₹2,299",
      statusType: "cancelled",
    },
  ];

  const topSellers = [
    {
      id: 1,
      name: "Artisan Hub",
      sales: 450,
      revenue: "₹999",
      rank: "🥇",
    },
    {
      id: 2,
      name: "Crafty Corner",
      sales: 380,
      revenue: "₹1,250",
      rank: "🥈",
    },
    {
      id: 3,
      name: "Design Studio",
      sales: 320,
      revenue: "₹850",
      rank: "🥉",
    },
    {
      id: 4,
      name: "Handmade Co.",
      sales: 290,
      revenue: "₹700",
      rank: "🏅",
    },
    {
      id: 5,
      name: "Creative Minds",
      sales: 260,
      revenue: "₹650",
      rank: "🏅",
    },
  ];


  return (
    <section className="mx-auto max-w-7xl">
      {/* Stats */}
      <StatCard statsData={statsData} />

      {/* Charts */}
      <div className="mt-2 flex flex-wrap gap-4">
        <AraaChart RevenueData={monthlyRevenue} />
        <BarChart orderData={orderVelocity} />
      </div>

      {/* tables */}
      <div className="mt-2 flex flex-wrap justify-between sm:gap-4">
        {/* Recent Orders */}
        <RecentOrdersCard OrdersData={orders} redirectTo={"/admin-dashboard/orders"} />

        {/* Top Sellers */}
        <LeaderboardCard leaderboardData={topSellers} title={"Sellers"} redirectTo={"/admin-dashboard/sellers"} />
      </div>
    </section>
  )
}

export default AdminDashboard;