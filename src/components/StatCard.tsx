interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  color: string;
  trend?: React.ReactNode;
}

export default function StatCard({ label, value, icon, bg, border, color, trend }: StatCardProps) {
  return (
    <div className={`stat-card ${bg} border ${border}`}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {icon}
        </div>
        {trend ?? <div className="w-4 h-4" />}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
