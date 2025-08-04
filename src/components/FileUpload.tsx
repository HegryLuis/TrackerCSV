import Papa from "papaparse";
import { ExperimentDataPoint } from "@/types";

interface FileUploadProps {
  onDataParsed: (data: ExperimentDataPoint[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUpload({
  onDataParsed,
  setIsLoading,
}: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const cleanData = results.data.filter(
          (row: any) => row.experiment_id
        ) as ExperimentDataPoint[];
        onDataParsed(cleanData);
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error);
        setIsLoading(false);
      },
    });
  };

  return (
    <div>
      <label
        htmlFor="csv-upload"
        className="cursor-pointer p-2 bg-fuchsia-800 text-blue-100 rounded-md"
      >
        Upload CSV
      </label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
