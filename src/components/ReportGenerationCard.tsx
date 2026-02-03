import { useNavigate } from "react-router-dom";

export default function ReportGenerationCard() {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl shadow-lg bg-card/70 hover:bg-primary/10 border border-primary/20 p-8 flex flex-col items-center transition-all duration-200"
      onClick={() => navigate("/report-generation")}
    >
      <h2 className="text-2xl font-semibold mb-2 text-primary text-center">Report Generation</h2>
      <p className="text-center text-muted-foreground">Automated report generation for test results (coming soon)</p>
    </div>
  );
}
