import { useState, useEffect, useRef } from "react";
import { ExperimentDataPoint } from "@/types";

type ChartData = {
  [metricName: string]: {
    step: number;
    [experimentId: string]: number;
  }[];
};

export const useChartDataWorker = (
  allData: ExperimentDataPoint[],
  selectedIds: string[]
) => {
  const [chartData, setChartData] = useState<ChartData>({});
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const workerRef = useRef<Worker | undefined>(undefined);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/chartData.worker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent<ChartData>) => {
      console.log("Main thread: Received data from worker.");
      setChartData(event.data);
      setIsCalculating(false);
    };

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error);
      setIsCalculating(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setChartData({});
      setIsCalculating(false);
      return;
    }

    if (workerRef.current) {
      setIsCalculating(true);
      console.log("Main thread: Sending data to worker.");
      workerRef.current.postMessage({ allData, selectedIds });
    }
  }, [allData, selectedIds]);

  return { chartData, isCalculating };
};
