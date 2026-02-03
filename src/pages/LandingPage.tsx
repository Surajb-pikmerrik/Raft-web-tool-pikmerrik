
import EcuExtractParserCard from "@/components/EcuExtractParserCard";
import RaftSwcCard from "@/components/RaftSwcCard";
import DidIntegrationCard from "@/components/DidIntegrationCard";
import CCodeGenerationCard from "@/components/CCodeGenerationCard";
import CaplGenerationCard from "@/components/CaplGenerationCard";
import ReportGenerationCard from "@/components/ReportGenerationCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl text-center mt-8">
          Unified platform for automotive software testing, code generation, and reporting. Select a tool to get started.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          <EcuExtractParserCard />
          <RaftSwcCard />
          <DidIntegrationCard />
          <CCodeGenerationCard />
          <CaplGenerationCard />
          <ReportGenerationCard />
        </div>
      </div>
    </div>
  );
}
