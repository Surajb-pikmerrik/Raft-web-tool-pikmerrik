import { useNavigate } from "react-router-dom";

export default function EcuExtractParserCard() {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl shadow-lg bg-card/70 hover:bg-primary/10 border border-primary/20 p-8 flex flex-col items-center transition-all duration-200"
      onClick={() => navigate("/ecu-extract-parser")}
    >
      <h2 className="text-2xl font-semibold mb-2 text-primary text-center">ECU Extract Parser</h2>
      <p className="text-center text-muted-foreground">Parse and analyze AUTOSAR ARXML ECU extract files.</p>
    </div>
  );
}
