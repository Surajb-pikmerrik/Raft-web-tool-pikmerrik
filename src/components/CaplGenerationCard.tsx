import { useNavigate } from "react-router-dom";

export default function CaplGenerationCard() {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl shadow-lg bg-card/70 hover:bg-primary/10 border border-primary/20 p-8 flex flex-col items-center transition-all duration-200"
      onClick={() => navigate("/capl-generation")}
    >
      <h2 className="text-2xl font-semibold mb-2 text-primary text-center">CAPL Generation</h2>
      <p className="text-center text-muted-foreground">Generate CAPL scripts for CANoe (coming soon)</p>
    </div>
  );
}
