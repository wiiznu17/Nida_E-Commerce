import { RevenueAreaChart } from './RevenueAreaChart';
import { DepartmentDonutChart } from './DepartmentDonutChart';
import { FulfillmentGaugeChart } from './FulfillmentGaugeChart';
import type { DashboardChartsData } from './dashboardTypes';

interface DashboardChartsSectionProps {
  data: DashboardChartsData;
}

export function DashboardChartsSection({ data }: DashboardChartsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Full Width: Revenue Curve Chart */}
      <div className="w-full">
        <RevenueAreaChart
          points={data.revenuePoints}
          timeframe={data.timeframe}
          onTimeframeChange={data.onTimeframeChange}
        />
      </div>

      {/* Side-by-Side: Sales by Department (Wider) & Operations Fulfillment Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <DepartmentDonutChart shares={data.departmentShares} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <FulfillmentGaugeChart
            score={data.fulfillmentScore}
            avgHours={data.avgHours}
            onTimeDispatchPct={data.onTimeDispatchPct}
          />
        </div>
      </div>
    </div>
  );
}
