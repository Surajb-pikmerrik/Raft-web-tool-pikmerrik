import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/FileUpload";
import { ParsedDataView } from "@/components/ParsedDataView";
import { CompareView } from "@/components/CompareView";
import { parseARXMLFile } from "@/lib/arxmlParser";
import type { ParsedARXMLData } from "@/lib/arxmlParser";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState<ParsedARXMLData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("parse");
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      const text = await file.text();
      const data = parseARXMLFile(text);
      setParsedData(data);
      
      toast({
        title: "Parsing Complete",
        description: `Successfully parsed ${data.messages.length} PDUs (messages), ${data.signals.length} signals, ${data.signalGroups.length} signal groups, and ${data.messageGroups.length} message groups.`,
      });
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse ARXML file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
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
          {/* ...existing code... */}
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="parse">Parse ECU Extract</TabsTrigger>
            <TabsTrigger value="compare">Compare ECU Extracts</TabsTrigger>
          </TabsList>

          <TabsContent value="parse" className="space-y-8">
            <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            {parsedData && <ParsedDataView data={parsedData} />}
          </TabsContent>

          <TabsContent value="compare">
            <CompareView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
