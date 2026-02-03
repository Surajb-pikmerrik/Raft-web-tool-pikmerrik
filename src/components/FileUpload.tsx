import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileCode } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileUpload, isProcessing }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.arxml', '.xml'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <Card className="border-2 border-dashed hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`cursor-pointer ${
            isDragActive ? "scale-105" : ""
          } transition-transform duration-200`}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-4">
            {isProcessing ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse flex-shrink-0">
                  <FileCode className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-foreground">
                    Processing ARXML file...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Analyzing ECU extract data
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-tech flex items-center justify-center shadow-tech flex-shrink-0">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-foreground">
                    {isDragActive ? "Drop your ARXML file here" : "Upload ARXML File"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to select • .arxml or .xml files
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
