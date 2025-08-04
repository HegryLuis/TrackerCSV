import { ExperimentDataPoint } from "@/types";
import MetricChart from "./MetricChart";
import { useChartDataWorker } from "@/hooks/useChartDataWorker";

interface ChartsDashboardProps {
  allData: ExperimentDataPoint[];
  selectedIds: string[];
}

type ChartData = {
  [metricName: string]: {
    step: number;
    [experimentId: string]: number;
  }[];
};

const prepareDataForCharts = (
  data: ExperimentDataPoint[],
  ids: string[]
): ChartData => {
  if (ids.length === 0) return {};

  const filteredData = data.filter((d) => ids.includes(d.experiment_id));

  return filteredData.reduce<ChartData>((acc, curr) => {
    const { metric_name, step, value, experiment_id } = curr;

    if (!acc[metric_name]) {
      acc[metric_name] = [];
    }

    let stepObject = acc[metric_name].find((item) => item.step === step);

    if (!stepObject) {
      stepObject = { step };
      acc[metric_name].push(stepObject);
    }

    stepObject[experiment_id] = value;

    return acc;
  }, {});
};

export default function ChartsDashboard({
  allData,
  selectedIds,
}: ChartsDashboardProps) {
  const { chartData, isCalculating } = useChartDataWorker(allData, selectedIds);
  const metricNames = Object.keys(chartData);

  if (selectedIds.length === 0) {
    return (
      <p className="text-center">
        <span
          className="
    bg-gradient-to-r from-fuchsia-500 to-purple-600 
    bg-clip-text text-transparent
  "
        >
          Select one or more experiments to visualize.
        </span>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
      {metricNames.map((metric) => (
        <div key={metric} className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-2 capitalize">
            {metric.replace(/_/g, " ")}
          </h3>
          <MetricChart data={chartData[metric]} lines={selectedIds} />
        </div>
      ))}
    </div>
  );
}
