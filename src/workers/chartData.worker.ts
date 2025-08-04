interface ExperimentDataPoint {
  experiment_id: string;
  metric_name: string;
  step: number;
  value: number;
}

type ChartData = {
  [metricName: string]: {
    step: number;
    [experimentId: string]: number;
  }[];
};

const prepareDataForCharts_Optimized = (
  data: ExperimentDataPoint[],
  ids: string[]
): ChartData => {
  if (ids.length === 0) return {};

  const filteredData = data.filter((d) => ids.includes(d.experiment_id));

  const intermediate: {
    [metric: string]: {
      [step: number]: { step: number; [expId: string]: number };
    };
  } = {};

  for (const row of filteredData) {
    const { metric_name, step, value, experiment_id } = row;
    if (!intermediate[metric_name]) intermediate[metric_name] = {};
    if (!intermediate[metric_name][step])
      intermediate[metric_name][step] = { step };
    intermediate[metric_name][step][experiment_id] = value;
  }

  const finalChartData: ChartData = {};
  for (const metric in intermediate) {
    finalChartData[metric] = Object.values(intermediate[metric]);
  }

  return finalChartData;
};

/**
 * Упрощает (прореживает) данные для графика.
 * @param data - Исходный массив точек для одной метрики.
 * @param threshold - Максимальное количество точек, которое мы хотим видеть. Если точек меньше, ничего не делаем.
 * @returns - Новый, более короткий массив точек.
 */
const downsampleData = (
  data: { step: number; [key: string]: number }[],
  threshold: number
) => {
  if (data.length <= threshold) return data;

  const result: { step: number; [key: string]: number }[] = [];
  const totalLength = data.length;
  const bucketSize = Math.ceil(totalLength / threshold);

  for (let i = 0; i < totalLength; i += bucketSize) {
    const chunk = data.slice(i, i + bucketSize);
    if (chunk.length === 0) continue;

    const aggregatedPoint: { step: number; [key: string]: number } = {
      step: chunk[0].step,
    };

    const keys = new Set<string>();
    for (const point of chunk) {
      Object.keys(point).forEach((key) => {
        if (key !== "step") keys.add(key);
      });
    }

    keys.forEach((key) => {
      let sum = 0;
      let count = 0;
      for (const point of chunk) {
        if (typeof point[key] === "number") {
          sum += point[key];
          count++;
        }
      }
      if (count > 0) {
        aggregatedPoint[key] = sum / count;
      }
    });

    result.push(aggregatedPoint);
  }
  return result;
};

self.addEventListener(
  "message",
  (
    event: MessageEvent<{
      allData: ExperimentDataPoint[];
      selectedIds: string[];
    }>
  ) => {
    console.log("Worker: Received data from main thread.");

    const { allData, selectedIds } = event.data;

    const chartData = prepareDataForCharts_Optimized(allData, selectedIds);

    console.log("Worker: Downsampling data...");
    const downsampledChartData: ChartData = {};
    const DOWNSAMPLE_THRESHOLD = 2000;

    for (const metric in chartData) {
      downsampledChartData[metric] = downsampleData(
        chartData[metric],
        DOWNSAMPLE_THRESHOLD
      );
      console.log(
        `Worker: Downsampled metric '${metric}' from ${chartData[metric].length} to ${downsampledChartData[metric].length} points.`
      );
    }

    console.log("Worker: Calculation complete. Sending downsampled data back.");

    self.postMessage(downsampledChartData);
  }
);
