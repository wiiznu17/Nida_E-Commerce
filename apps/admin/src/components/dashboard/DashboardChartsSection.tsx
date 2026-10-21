import { RevenueAreaChart } from './RevenueAreaChart';
import { DepartmentDonutChart } from './DepartmentDonutChart';
import { FulfillmentGaugeChart } from './FulfillmentGaugeChart';
import type { DashboardChartsData } from './dashboardTypes';

interface DashboardChartsSectionProps {
  data: DashboardChartsData;
}

export function DashboardChartsSection({ data }: DashboardChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* 8 Columns: Revenue Curve Chart */}
      <div className="lg:col-span-8 flex flex-col">
        <RevenueAreaChart
          points={data.revenuePoints}
          timeframe={data.timeframe}
          onTimeframeChange={data.onTimeframeChange}
        />
      </div>

      {/* 4 Columns: Department Donut & Operations Gauge */}
      <div className="lg:col-span-4 flex flex-col space-y-4 justify-between">
        <DepartmentDonutChart shares={data.departmentShares} />
        <FulfillmentGaugeChart
          score={data.fulfillmentScore}
          avgHours={data.avgHours}
          onTimeDispatchPct={data.onTimeDispatchPct}
        />
      </div>
    </div>
  );
}
