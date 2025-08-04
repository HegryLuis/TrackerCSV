"use client";

import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { ExperimentDataPoint } from "@/types";
import { UploadCloud } from "lucide-react";

interface CsvUploaderProps {
  onDataParsed: (data: ExperimentDataPoint[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function CsvUploader({
  onDataParsed,
  setIsLoading,
}: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.");
      return;
    }

    setError(null);
    setFile(file);
    setIsLoading(true);

    const isExperimentDataPoint = (
      row: unknown
    ): row is ExperimentDataPoint => {
      if (typeof row !== "object" || row === null) {
        return false;
      }
      const point = row as Record<string, unknown>;
      return (
        typeof point.experiment_id === "string" &&
        typeof point.metric_name === "string" &&
        typeof point.step === "number" &&
        typeof point.value === "number"
      );
    };

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const cleanData = results.data.filter(isExperimentDataPoint);

        if (cleanData.length === 0) {
          setError("The CSV file is empty or has an invalid format.");
          setIsLoading(false);
          return;
        }

        onDataParsed(cleanData);
        setIsLoading(false);
      },
      error: (error: Error) => {
        console.error("Error parsing CSV:", error);
        setError("Failed to parse the CSV file. Please check its format.");
        setIsLoading(false);
      },
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-1 flex flex-col items-center justify-center w-full p-6
                   border-2 border-dashed rounded-xl transition-colors cursor-pointer
                   ${
                     isDragging
                       ? "border-fuchsia-500 bg-fuchsia-500/10"
                       : "border-gray-300 hover:border-gray-400 bg-gray-50"
                   }`}
      >
        <div className="text-center">
          <UploadCloud
            className={`mx-auto h-12 w-12 text-gray-400 ${
              isDragging ? "text-fuchsia-500" : ""
            }`}
          />

          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-fuchsia-600">
              Upload a file
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">CSV files only</p>

          {file && !error && (
            <p className="text-sm font-semibold text-green-600 mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="pt-2 pb-2 text-red-500 text-sm text-center bg-white rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}
