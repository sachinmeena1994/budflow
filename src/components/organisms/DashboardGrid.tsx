
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Clock, Award, TrendingUp, Package, Settings, Activity } from 'lucide-react';
import { SummaryCard } from '../atoms/SummaryCard';
import { ChartCard } from '../molecules/ChartCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const productivityData = [
  { name: 'Harvest', value: 35, color: '#10b981' },
  { name: 'Machine', value: 28, color: '#3b82f6' },
  { name: 'Hand', value: 22, color: '#f59e0b' },
  { name: 'Breakdown', value: 15, color: '#ef4444' },
];

const weeklyData = [
  { day: 'Mon', hours: 62, productivity: 85 },
  { day: 'Tue', hours: 58, productivity: 78 },
  { day: 'Wed', hours: 71, productivity: 92 },
  { day: 'Thu', hours: 69, productivity: 88 },
  { day: 'Fri', hours: 65, productivity: 91 },
  { day: 'Sat', hours: 48, productivity: 76 },
  { day: 'Sun', hours: 15, productivity: 65 },
];

const thisWeekStats = {
  technicians: 12,
  productivity: 85,
  hours: 388,
  quality: 94
};

const lastWeekStats = {
  technicians: 11,
  productivity: 82,
  hours: 364,
  quality: 91
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
      >
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{`${entry.name}: ${entry.value}`}</span>
            {entry.name === 'hours' && ' hrs'}
            {entry.name === 'productivity' && '%'}
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
      >
        <p className="font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
          {`${payload[0].value}%`}
        </p>
      </motion.div>
    );
  }
  return null;
};

export const DashboardGrid: React.FC = () => {
  const [showLastWeek, setShowLastWeek] = useState(false);
  const currentStats = showLastWeek ? lastWeekStats : thisWeekStats;

  const summaryCards = [
    {
      title: 'Total Technicians',
      value: currentStats.technicians,
      subtitle: 'Active this week',
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: 'Avg Productivity',
      value: `${currentStats.productivity}%`,
      subtitle: 'Units per hour',
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: 'Total Hours',
      value: currentStats.hours,
      subtitle: 'Logged this week',
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: 'Quality Score',
      value: `${currentStats.quality}%`,
      subtitle: 'Average rating',
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLastWeek(false)}
            className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
              !showLastWeek 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setShowLastWeek(true)}
            className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
              showLastWeek 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Last Week
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SummaryCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Work Type Distribution"
          subtitle="Breakdown by process type"
          className="hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productivityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {productivityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    stroke={entry.color}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weekly Performance"
          subtitle="Hours logged and productivity"
          className="hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hours" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
