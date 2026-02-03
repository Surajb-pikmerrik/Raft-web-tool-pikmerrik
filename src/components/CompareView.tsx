import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { ComparisonResult } from "@/components/ComparisonResult";
import { parseARXMLFile } from "@/lib/arxmlParser";
import { compareEcuExtracts } from "@/lib/compareEcuExtracts";
import type { ParsedARXMLData } from "@/lib/arxmlParser";
import type { ComparisonResult as ComparisonResultType } from "@/lib/compareEcuExtracts";
import { useToast } from "@/hooks/use-toast";
import { GitCompare } from "lucide-react";

export const CompareView = () => {
  const [baseData, setBaseData] = useState<ParsedARXMLData | null>(null);
  const [newData, setNewData] = useState<ParsedARXMLData | null>(null);
  const [isProcessingBase, setIsProcessingBase] = useState(false);
  const [isProcessingNew, setIsProcessingNew] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResultType | null>(null);
  const { toast } = useToast();

  const handleBaseFileUpload = async (file: File) => {
    try {
      setIsProcessingBase(true);
      const text = await file.text();
      const data = parseARXMLFile(text);
      setBaseData(data);
      setComparisonResult(null);
      
      toast({
        title: "Base ECU Extract Loaded",
        description: `Parsed ${data.messages.length} messages and ${data.signals.length} signals.`,
      });
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse base ARXML file",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBase(false);
    }
  };

  const handleNewFileUpload = async (file: File) => {
    try {
      setIsProcessingNew(true);
      const text = await file.text();
      const data = parseARXMLFile(text);
      setNewData(data);
      setComparisonResult(null);
      
      toast({
        title: "New ECU Extract Loaded",
        description: `Parsed ${data.messages.length} messages and ${data.signals.length} signals.`,
      });
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse new ARXML file",
        variant: "destructive",
      });
    } finally {
      setIsProcessingNew(false);
    }
  };

  const handleCompare = () => {
    if (!baseData || !newData) {
      toast({
        title: "Missing Data",
        description: "Please upload both base and new ECU extracts before comparing.",
        variant: "destructive",
      });
      return;
    }

    const result = compareEcuExtracts(baseData, newData);
    setComparisonResult(result);

    const totalChanges = 
      result.added.messages.length + result.added.signals.length +
      result.deleted.messages.length + result.deleted.signals.length +
      result.modified.messages.length + result.modified.signals.length;

    toast({
      title: "Comparison Complete",
      description: `Found ${totalChanges} total changes between the ECU extracts.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare ECU Extracts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Base ECU Extract</h3>
              <FileUpload onFileUpload={handleBaseFileUpload} isProcessing={isProcessingBase} />
              {baseData && (
                <p className="text-sm text-muted-foreground mt-2">
                  ✓ Loaded: {baseData.messages.length} messages, {baseData.signals.length} signals
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">New ECU Extract</h3>
              <FileUpload onFileUpload={handleNewFileUpload} isProcessing={isProcessingNew} />
              {newData && (
                <p className="text-sm text-muted-foreground mt-2">
                  ✓ Loaded: {newData.messages.length} messages, {newData.signals.length} signals
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={!baseData || !newData || isProcessingBase || isProcessingNew}
              size="lg"
              className="min-w-[200px]"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Extracts
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparisonResult && <ComparisonResult result={comparisonResult} />}
    </div>
  );
};
