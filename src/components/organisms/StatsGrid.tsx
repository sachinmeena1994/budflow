
import { StatCard } from "@/components/molecules/StatCard";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";

const statsData = [
  {
    title: "Total Balance",
    value: "$12,847.50",
    icon: DollarSign,
    trend: { value: "12.5%", isPositive: true }
  },
  {
    title: "Monthly Income",
    value: "$4,250.00",
    icon: TrendingUp,
    trend: { value: "8.2%", isPositive: true }
  },
  {
    title: "Monthly Expenses",
    value: "$2,890.75",
    icon: TrendingDown,
    trend: { value: "3.1%", isPositive: false }
  },
  {
    title: "Days Left",
    value: "15",
    icon: Calendar
  }
];

export const StatsGrid = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </section>
  );
};
