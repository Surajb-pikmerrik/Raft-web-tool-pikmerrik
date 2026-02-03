import { useNavigate } from "react-router-dom";

export default function CCodeGenerationCard() {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl shadow-lg bg-card/70 hover:bg-primary/10 border border-primary/20 p-8 flex flex-col items-center transition-all duration-200"
      onClick={() => navigate("/c-code-generation")}
    >
      <h2 className="text-2xl font-semibold mb-2 text-primary text-center">C Code Generation</h2>
      <p className="text-center text-muted-foreground">Generate C code from ARXML or configuration (coming soon)</p>
    </div>
  );
}
