import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileCode } from "lucide-react";

const RaftSwcPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast({
        title: "File Selected",
        description: `Selected ${acceptedFiles[0].name}`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Read file as ArrayBuffer
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      // Assume first sheet contains the relevant data
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Generate ARXML content (simple example)
      const arxmlContent = generateArxml(jsonData);

      // Trigger download
      const blob = new Blob([arxmlContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "raft_swc.arxml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "RAFT SWC ARXML Generated",
        description: `Successfully generated ARXML from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Example ARXML generator (customize as needed)
  function generateArxml(data: any[]): string {
    // This is a placeholder. You should build ARXML according to your schema.
    return `<?xml version="1.0" encoding="UTF-8"?>\n<RAFSWC>\n${data
      .map(
        (row, i) => `  <Item index=\"${i}\">${Object.entries(row)
          .map(([k, v]) => `<${k}>${v}</${k}>`)
          .join("")}</Item>`
      )
      .join("\n")}\n</RAFSWC>`;
  }

          // Generate AUTOSAR-compliant ARXML for RAFT_SWC
          const arxmlContent = generateArxml(jsonData);
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex justify-end">
          <button
            className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition"
            onClick={() => navigate("/")}
          >
            Go to Main Page
          </button>
        </div>
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-center">RAFT SWC Generator</h1>
        </header>
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <Card className="border-2 border-dashed hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <div
                  {...getRootProps()}
                  className={`cursor-pointer ${isDragActive ? "scale-105" : ""} transition-transform duration-200`}
                >
                  <input {...getInputProps()} />
                  <div className="flex items-center justify-center gap-4">
                    {isProcessing ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse flex-shrink-0">
                          <FileCode className="w-6 h-6 text-primary" />
                        </div>
      function generateArxml(data: any[]): string {
        return `<?xml version="1.0" encoding="utf-8"?>
    <!--This file was ganerated using the RAFT-->
    <AUTOSAR xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_00044.xsd" xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <AR-PACKAGES>
        <AR-PACKAGE>
          <SHORT-NAME>ComponentTypes</SHORT-NAME>
          <ELEMENTS>
            <APPLICATION-SW-COMPONENT-TYPE>
                const arxmlContent = generateArxml(jsonData); // This line will remain after moving the function
              <INTERNAL-BEHAVIORS>
                <SWC-INTERNAL-BEHAVIOR>
                  <SHORT-NAME>RAFT_SWC_InternalBehavior</SHORT-NAME>
                  <SUPPORTS-MULTIPLE-INSTANTIATION>false</SUPPORTS-MULTIPLE-INSTANTIATION>
                </SWC-INTERNAL-BEHAVIOR>
              </INTERNAL-BEHAVIORS>
            </APPLICATION-SW-COMPONENT-TYPE>
            <SWC-IMPLEMENTATION>
              <SHORT-NAME>RAFT_SWC_Implementation</SHORT-NAME>
              <BEHAVIOR-REF DEST="SWC-INTERNAL-BEHAVIOR">/ComponentTypes/RAFT_SWC/RAFT_SWC_InternalBehavior</BEHAVIOR-REF>
            </SWC-IMPLEMENTATION>
          </ELEMENTS>
        </AR-PACKAGE>
      </AR-PACKAGES>
    </AUTOSAR>`;
      }
                        <div className="w-12 h-12 rounded-full bg-gradient-tech flex items-center justify-center shadow-tech flex-shrink-0">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-base font-semibold text-foreground">
                            {isDragActive ? "Drop your Excel file here" : "Upload Excel File"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Drag and drop or click to select • .xlsx or .xls files
                          </p>
                        </div>
          // Place this function outside the RaftSwcPage component
          function generateArxml(data: any[]): string {
            return `<?xml version="1.0" encoding="utf-8"?>\n<!--This file was ganerated using the RAFT-->\n<AUTOSAR xsi:schemaLocation="http://autosar.org/schema/r4.0 AUTOSAR_00044.xsd" xmlns="http://autosar.org/schema/r4.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <AR-PACKAGES>\n    <AR-PACKAGE>\n      <SHORT-NAME>ComponentTypes</SHORT-NAME>\n      <ELEMENTS>\n        <APPLICATION-SW-COMPONENT-TYPE>\n          <SHORT-NAME>RAFT_SWC</SHORT-NAME>\n          <INTERNAL-BEHAVIORS>\n            <SWC-INTERNAL-BEHAVIOR>\n              <SHORT-NAME>RAFT_SWC_InternalBehavior</SHORT-NAME>\n              <SUPPORTS-MULTIPLE-INSTANTIATION>false</SUPPORTS-MULTIPLE-INSTANTIATION>\n            </SWC-INTERNAL-BEHAVIOR>\n          </INTERNAL-BEHAVIORS>\n        </APPLICATION-SW-COMPONENT-TYPE>\n        <SWC-IMPLEMENTATION>\n          <SHORT-NAME>RAFT_SWC_Implementation</SHORT-NAME>\n          <BEHAVIOR-REF DEST="SWC-INTERNAL-BEHAVIOR">/ComponentTypes/RAFT_SWC/RAFT_SWC_InternalBehavior</BEHAVIOR-REF>\n        </SWC-IMPLEMENTATION>\n      </ELEMENTS>\n    </AR-PACKAGE>\n  </AR-PACKAGES>\n</AUTOSAR>`;
          }
                      </>
                    )}
                  </div>
                  {file && !isProcessing && (
                    <div className="mt-4 text-center text-sm text-foreground">
                      Selected file: <span className="font-medium">{file.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <button
              className="w-full px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition disabled:opacity-50"
              onClick={handleUpload}
              disabled={!file || isProcessing}
            >
              {isProcessing ? "Processing..." : "Upload & Generate RAFT SWC"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaftSwcPage;
