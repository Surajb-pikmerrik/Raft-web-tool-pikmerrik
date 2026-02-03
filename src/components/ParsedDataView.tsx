import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { exportToExcel } from "@/lib/excelExporter";
import type { ParsedARXMLData, MessageData, SignalData, SignalGroupData, MessageGroupData } from "@/lib/arxmlParser";
import { Badge } from "@/components/ui/badge";

interface ParsedDataViewProps {
  data: ParsedARXMLData;
}

type SortDirection = "asc" | "desc" | null;

interface SortConfig<T> {
  key: T;
  direction: SortDirection;
}

type MessageSortKey = keyof MessageData | "addressing";
type SignalSortKey = keyof SignalData;
type SignalGroupSortKey = "name" | "portInterface" | "signalCount";
type MessageGroupSortKey = "name" | "messageCount";

const SortableHeader = <T extends string>({ 
  label, 
  sortKey, 
  currentSort, 
  onSort 
}: { 
  label: string; 
  sortKey: T; 
  currentSort: SortConfig<T> | null;
  onSort: (key: T) => void;
}) => {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;
  
  return (
    <th 
      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/70 transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {direction === "asc" ? (
          <ArrowUp className="h-4 w-4 text-primary" />
        ) : direction === "desc" ? (
          <ArrowDown className="h-4 w-4 text-primary" />
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </th>
  );
};

function handleSort<T>(key: T, prev: SortConfig<T> | null): SortConfig<T> | null {
  if (prev?.key !== key) {
    return { key, direction: "asc" };
  }
  if (prev.direction === "asc") {
    return { key, direction: "desc" };
  }
  return null;
}

export const ParsedDataView = ({ data }: ParsedDataViewProps) => {
  const [messageSort, setMessageSort] = useState<SortConfig<MessageSortKey> | null>(null);
  const [signalSort, setSignalSort] = useState<SortConfig<SignalSortKey> | null>(null);
  const [signalGroupSort, setSignalGroupSort] = useState<SortConfig<SignalGroupSortKey> | null>(null);
  const [messageGroupSort, setMessageGroupSort] = useState<SortConfig<MessageGroupSortKey> | null>(null);

  const handleExport = () => {
    exportToExcel(data);
  };

  const sortedMessages = useMemo(() => {
    if (!messageSort || !messageSort.direction) return data.messages;

    const { key, direction } = messageSort;
    return [...data.messages].sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      if (key === "addressing") {
        aVal = a.canAddressingMode || a.addressingFormat || "";
        bVal = b.canAddressingMode || b.addressingFormat || "";
      } else if (key === "signals") {
        return 0;
      } else {
        const aField = a[key];
        const bField = b[key];
        aVal = Array.isArray(aField) ? undefined : aField;
        bVal = Array.isArray(bField) ? undefined : bField;
      }

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data.messages, messageSort]);

  const sortedSignals = useMemo(() => {
    if (!signalSort || !signalSort.direction) return data.signals;

    const { key, direction } = signalSort;
    return [...data.signals].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === undefined || aVal === null) return direction === "asc" ? 1 : -1;
      if (bVal === undefined || bVal === null) return direction === "asc" ? -1 : 1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return direction === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data.signals, signalSort]);

  const sortedSignalGroups = useMemo(() => {
    if (!signalGroupSort || !signalGroupSort.direction) return data.signalGroups;

    const { key, direction } = signalGroupSort;
    return [...data.signalGroups].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (key === "signalCount") {
        aVal = a.signals.length;
        bVal = b.signals.length;
      } else if (key === "portInterface") {
        aVal = (a.portInterface || "").toLowerCase();
        bVal = (b.portInterface || "").toLowerCase();
      } else {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc" 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data.signalGroups, signalGroupSort]);

  const sortedMessageGroups = useMemo(() => {
    if (!messageGroupSort || !messageGroupSort.direction) return data.messageGroups;

    const { key, direction } = messageGroupSort;
    return [...data.messageGroups].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (key === "messageCount") {
        aVal = a.messages.length;
        bVal = b.messages.length;
      } else {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc" 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data.messageGroups, messageGroupSort]);

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/20 shadow-tech bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Parsed ECU Data</CardTitle>
              <CardDescription>
                Review extracted automotive communication data before export
              </CardDescription>
            </div>
            <Button 
              onClick={handleExport} 
              size="lg"
              className="bg-gradient-tech hover:opacity-90 shadow-tech"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Messages" value={data.messages.length} color="primary" />
            <StatsCard label="Signals" value={data.signals.length} color="accent" />
            <StatsCard label="Signal Groups" value={data.signalGroups.length} color="primary" />
            <StatsCard label="Message Groups" value={data.messageGroups.length} color="accent" />
          </div>

          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="signalGroups">Signal Groups</TabsTrigger>
              <TabsTrigger value="messageGroups">Message Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-background/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <SortableHeader label="Frame Name" sortKey="frameName" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="PDU Name" sortKey="name" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="CAN ID (Hex)" sortKey="canIdHex" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="PDU Type" sortKey="pduType" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="Direction" sortKey="direction" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="Addressing" sortKey="addressing" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="Type" sortKey="type" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="Cycle Time (ms)" sortKey="cycleTime" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                        <SortableHeader label="Length (bytes)" sortKey="length" currentSort={messageSort} onSort={(k) => setMessageSort(handleSort(k, messageSort))} />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMessages.map((msg, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{msg.frameName || "-"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{msg.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-primary">{msg.canIdHex || "-"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{msg.pduType}</td>
                          <td className="px-4 py-3">
                            {msg.direction ? (
                              <Badge variant={msg.direction === "Tx" ? "default" : "secondary"}>{msg.direction}</Badge>
                            ) : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const addressingValue = msg.canAddressingMode || msg.addressingFormat;
                              return addressingValue ? (
                                <Badge variant={addressingValue === "EXTENDED" ? "default" : "outline"}>{addressingValue}</Badge>
                              ) : "-";
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={msg.type === "Periodic" ? "default" : "secondary"}>{msg.type}</Badge>
                          </td>
                          <td className="px-4 py-3">{msg.cycleTime || "-"}</td>
                          <td className="px-4 py-3">{msg.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signals" className="space-y-4">
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-background/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <SortableHeader label="Signal Name" sortKey="name" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Port Interface" sortKey="portInterface" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="PDU" sortKey="pduName" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Start Bit" sortKey="startPosition" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Length" sortKey="length" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Byte Order" sortKey="byteOrder" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Data Type" sortKey="dataType" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Min" sortKey="minValue" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                        <SortableHeader label="Max" sortKey="maxValue" currentSort={signalSort} onSort={(k) => setSignalSort(handleSort(k, signalSort))} />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSignals.map((sig, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{sig.name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{sig.portInterface || "-"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{sig.pduName || "-"}</td>
                          <td className="px-4 py-3">{sig.startPosition}</td>
                          <td className="px-4 py-3">{sig.length}</td>
                          <td className="px-4 py-3">{sig.byteOrder}</td>
                          <td className="px-4 py-3 font-mono text-xs">{sig.dataType}</td>
                          <td className="px-4 py-3">{sig.minValue || "-"}</td>
                          <td className="px-4 py-3">{sig.maxValue || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signalGroups" className="space-y-4">
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-background/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <SortableHeader label="Signal Group Name" sortKey="name" currentSort={signalGroupSort} onSort={(k) => setSignalGroupSort(handleSort(k, signalGroupSort))} />
                        <SortableHeader label="Port Interface" sortKey="portInterface" currentSort={signalGroupSort} onSort={(k) => setSignalGroupSort(handleSort(k, signalGroupSort))} />
                        <SortableHeader label="Signals Count" sortKey="signalCount" currentSort={signalGroupSort} onSort={(k) => setSignalGroupSort(handleSort(k, signalGroupSort))} />
                        <th className="px-4 py-3 text-left font-semibold">Signals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSignalGroups.map((group, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{group.name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{group.portInterface || "-"}</td>
                          <td className="px-4 py-3">{group.signals.length}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {group.signals.slice(0, 3).map((sig, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{sig}</Badge>
                              ))}
                              {group.signals.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{group.signals.length - 3} more</Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messageGroups" className="space-y-4">
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-background/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <SortableHeader label="Message Group Name" sortKey="name" currentSort={messageGroupSort} onSort={(k) => setMessageGroupSort(handleSort(k, messageGroupSort))} />
                        <SortableHeader label="Messages Count" sortKey="messageCount" currentSort={messageGroupSort} onSort={(k) => setMessageGroupSort(handleSort(k, messageGroupSort))} />
                        <th className="px-4 py-3 text-left font-semibold">Messages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMessageGroups.map((group, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{group.name}</td>
                          <td className="px-4 py-3">{group.messages.length}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {group.messages.slice(0, 3).map((msg, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{msg}</Badge>
                              ))}
                              {group.messages.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{group.messages.length - 3} more</Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const StatsCard = ({ label, value, color }: { label: string; value: number; color: "primary" | "accent" }) => (
  <Card className={`border-${color}/20 bg-${color}/5`}>
    <CardContent className="p-6">
      <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
      <div className={`text-3xl font-bold text-${color}`}>{value}</div>
    </CardContent>
  </Card>
);
