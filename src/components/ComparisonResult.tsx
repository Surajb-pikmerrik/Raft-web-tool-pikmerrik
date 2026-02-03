import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComparisonResult as ComparisonResultType, ModifiedItem } from "@/lib/compareEcuExtracts";
import type { MessageData, SignalData, SignalGroupData, MessageGroupData } from "@/lib/arxmlParser";
import { Plus, Minus, Edit } from "lucide-react";

interface ComparisonResultProps {
  result: ComparisonResultType;
}

export const ComparisonResult = ({ result }: ComparisonResultProps) => {
  const totalAdded = result.added.messages.length + result.added.signals.length + 
                     result.added.signalGroups.length + result.added.messageGroups.length;
  const totalDeleted = result.deleted.messages.length + result.deleted.signals.length + 
                       result.deleted.signalGroups.length + result.deleted.messageGroups.length;
  const totalModified = result.modified.messages.length + result.modified.signals.length + 
                        result.modified.signalGroups.length + result.modified.messageGroups.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Results</CardTitle>
        <div className="flex gap-4 mt-4">
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Plus className="w-3 h-3 mr-1" />
            {totalAdded} Added
          </Badge>
          <Badge variant="default" className="bg-red-500 hover:bg-red-600">
            <Minus className="w-3 h-3 mr-1" />
            {totalDeleted} Deleted
          </Badge>
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            <Edit className="w-3 h-3 mr-1" />
            {totalModified} Modified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="added">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="added">Added</TabsTrigger>
            <TabsTrigger value="deleted">Deleted</TabsTrigger>
            <TabsTrigger value="modified">Modified</TabsTrigger>
          </TabsList>

          <TabsContent value="added" className="space-y-6">
            <AddedSection result={result} />
          </TabsContent>

          <TabsContent value="deleted" className="space-y-6">
            <DeletedSection result={result} />
          </TabsContent>

          <TabsContent value="modified" className="space-y-6">
            <ModifiedSection result={result} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const AddedSection = ({ result }: { result: ComparisonResultType }) => {
  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="messages">Messages ({result.added.messages.length})</TabsTrigger>
        <TabsTrigger value="signals">Signals ({result.added.signals.length})</TabsTrigger>
        <TabsTrigger value="signalGroups">Signal Groups ({result.added.signalGroups.length})</TabsTrigger>
        <TabsTrigger value="messageGroups">Message Groups ({result.added.messageGroups.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="messages">
        <MessagesTable messages={result.added.messages} />
      </TabsContent>
      <TabsContent value="signals">
        <SignalsTable signals={result.added.signals} />
      </TabsContent>
      <TabsContent value="signalGroups">
        <SignalGroupsTable groups={result.added.signalGroups} />
      </TabsContent>
      <TabsContent value="messageGroups">
        <MessageGroupsTable groups={result.added.messageGroups} />
      </TabsContent>
    </Tabs>
  );
};

const DeletedSection = ({ result }: { result: ComparisonResultType }) => {
  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="messages">Messages ({result.deleted.messages.length})</TabsTrigger>
        <TabsTrigger value="signals">Signals ({result.deleted.signals.length})</TabsTrigger>
        <TabsTrigger value="signalGroups">Signal Groups ({result.deleted.signalGroups.length})</TabsTrigger>
        <TabsTrigger value="messageGroups">Message Groups ({result.deleted.messageGroups.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="messages">
        <MessagesTable messages={result.deleted.messages} />
      </TabsContent>
      <TabsContent value="signals">
        <SignalsTable signals={result.deleted.signals} />
      </TabsContent>
      <TabsContent value="signalGroups">
        <SignalGroupsTable groups={result.deleted.signalGroups} />
      </TabsContent>
      <TabsContent value="messageGroups">
        <MessageGroupsTable groups={result.deleted.messageGroups} />
      </TabsContent>
    </Tabs>
  );
};

const ModifiedSection = ({ result }: { result: ComparisonResultType }) => {
  return (
    <Tabs defaultValue="messages" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="messages">Messages ({result.modified.messages.length})</TabsTrigger>
        <TabsTrigger value="signals">Signals ({result.modified.signals.length})</TabsTrigger>
        <TabsTrigger value="signalGroups">Signal Groups ({result.modified.signalGroups.length})</TabsTrigger>
        <TabsTrigger value="messageGroups">Message Groups ({result.modified.messageGroups.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="messages">
        <ModifiedMessagesTable items={result.modified.messages} />
      </TabsContent>
      <TabsContent value="signals">
        <ModifiedSignalsTable items={result.modified.signals} />
      </TabsContent>
      <TabsContent value="signalGroups">
        <ModifiedSignalGroupsTable items={result.modified.signalGroups} />
      </TabsContent>
      <TabsContent value="messageGroups">
        <ModifiedMessageGroupsTable items={result.modified.messageGroups} />
      </TabsContent>
    </Tabs>
  );
};

const MessagesTable = ({ messages }: { messages: MessageData[] }) => {
  if (messages.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No messages</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Frame Name</TableHead>
            <TableHead>PDU Name</TableHead>
            <TableHead>CAN ID (Hex)</TableHead>
            <TableHead>PDU Type</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Addressing</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cycle Time (ms)</TableHead>
            <TableHead>Length (bits)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg, idx) => (
            <TableRow key={idx}>
              <TableCell>{msg.frameName || "-"}</TableCell>
              <TableCell className="font-medium">{msg.name}</TableCell>
              <TableCell><code className="text-sm">{msg.canIdHex || "-"}</code></TableCell>
              <TableCell>{msg.pduType || "-"}</TableCell>
              <TableCell>
                {msg.direction && (
                  <Badge variant="outline" className="font-mono">
                    {msg.direction}
                  </Badge>
                )}
                {!msg.direction && "-"}
              </TableCell>
              <TableCell>
                {(msg.canAddressingMode || msg.addressingFormat) && (
                  <Badge variant="secondary" className="font-mono">
                    {msg.canAddressingMode || msg.addressingFormat}
                  </Badge>
                )}
                {!msg.canAddressingMode && !msg.addressingFormat && "-"}
              </TableCell>
              <TableCell>{msg.type}</TableCell>
              <TableCell>{msg.cycleTime || "-"}</TableCell>
              <TableCell>{msg.length || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const SignalsTable = ({ signals }: { signals: SignalData[] }) => {
  if (signals.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No signals</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal Name</TableHead>
            <TableHead>PDU</TableHead>
            <TableHead>Start Bit</TableHead>
            <TableHead>Length</TableHead>
            <TableHead>Byte Order</TableHead>
            <TableHead>Data Type</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((sig, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{sig.name}</TableCell>
              <TableCell>{sig.pduName || "-"}</TableCell>
              <TableCell>{sig.startPosition ?? "-"}</TableCell>
              <TableCell>{sig.length}</TableCell>
              <TableCell>{sig.byteOrder}</TableCell>
              <TableCell>{sig.dataType || "-"}</TableCell>
              <TableCell>{sig.minValue ?? "-"}</TableCell>
              <TableCell>{sig.maxValue ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const SignalGroupsTable = ({ groups }: { groups: SignalGroupData[] }) => {
  if (groups.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No signal groups</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal Group Name</TableHead>
            <TableHead>Signals Count</TableHead>
            <TableHead>Signals</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>{group.signals.length}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {group.signals.slice(0, 3).map((signal, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {signal}
                    </Badge>
                  ))}
                  {group.signals.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.signals.length - 3} more
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const MessageGroupsTable = ({ groups }: { groups: MessageGroupData[] }) => {
  if (groups.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No message groups</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message Group Name</TableHead>
            <TableHead>Messages Count</TableHead>
            <TableHead>Messages</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>{group.messages.length}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {group.messages.slice(0, 3).map((message, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {message}
                    </Badge>
                  ))}
                  {group.messages.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.messages.length - 3} more
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ModifiedMessagesTable = ({ items }: { items: ModifiedItem<MessageData>[] }) => {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No modified messages</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PDU Name</TableHead>
            <TableHead>Changed Fields</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            item.changes.map((field, fieldIdx) => (
              <TableRow key={`${idx}-${fieldIdx}`}>
                {fieldIdx === 0 && (
                  <TableCell rowSpan={item.changes.length} className="font-medium align-top">
                    {item.old.name}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{field}</Badge>
                </TableCell>
                <TableCell className="bg-red-50 dark:bg-red-950/20">
                  <span className="text-red-600 dark:text-red-400">
                    {String(item.old[field as keyof MessageData] || "-")}
                  </span>
                </TableCell>
                <TableCell className="bg-green-50 dark:bg-green-950/20">
                  <span className="text-green-600 dark:text-green-400">
                    {String(item.new[field as keyof MessageData] || "-")}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ModifiedSignalsTable = ({ items }: { items: ModifiedItem<SignalData>[] }) => {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No modified signals</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signal Name</TableHead>
            <TableHead>Changed Fields</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            item.changes.map((field, fieldIdx) => (
              <TableRow key={`${idx}-${fieldIdx}`}>
                {fieldIdx === 0 && (
                  <TableCell rowSpan={item.changes.length} className="font-medium align-top">
                    {item.old.name}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{field}</Badge>
                </TableCell>
                <TableCell className="bg-red-50 dark:bg-red-950/20">
                  <span className="text-red-600 dark:text-red-400">
                    {String(item.old[field as keyof SignalData] || "-")}
                  </span>
                </TableCell>
                <TableCell className="bg-green-50 dark:bg-green-950/20">
                  <span className="text-green-600 dark:text-green-400">
                    {String(item.new[field as keyof SignalData] || "-")}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ModifiedSignalGroupsTable = ({ items }: { items: ModifiedItem<SignalGroupData>[] }) => {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No modified signal groups</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Changed Fields</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            item.changes.map((field, fieldIdx) => (
              <TableRow key={`${idx}-${fieldIdx}`}>
                {fieldIdx === 0 && (
                  <TableCell rowSpan={item.changes.length} className="font-medium align-top">
                    {item.old.name}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{field}</Badge>
                </TableCell>
                <TableCell className="bg-red-50 dark:bg-red-950/20">
                  <span className="text-red-600 dark:text-red-400">
                    {field === "signals" 
                      ? (item.old[field] as string[]).join(", ")
                      : String(item.old[field as keyof SignalGroupData] || "-")}
                  </span>
                </TableCell>
                <TableCell className="bg-green-50 dark:bg-green-950/20">
                  <span className="text-green-600 dark:text-green-400">
                    {field === "signals"
                      ? (item.new[field] as string[]).join(", ")
                      : String(item.new[field as keyof SignalGroupData] || "-")}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ModifiedMessageGroupsTable = ({ items }: { items: ModifiedItem<MessageGroupData>[] }) => {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No modified message groups</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Group Name</TableHead>
            <TableHead>Changed Fields</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            item.changes.map((field, fieldIdx) => (
              <TableRow key={`${idx}-${fieldIdx}`}>
                {fieldIdx === 0 && (
                  <TableCell rowSpan={item.changes.length} className="font-medium align-top">
                    {item.old.name}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{field}</Badge>
                </TableCell>
                <TableCell className="bg-red-50 dark:bg-red-950/20">
                  <span className="text-red-600 dark:text-red-400">
                    {field === "messages"
                      ? (item.old[field] as string[]).join(", ")
                      : String(item.old[field as keyof MessageGroupData] || "-")}
                  </span>
                </TableCell>
                <TableCell className="bg-green-50 dark:bg-green-950/20">
                  <span className="text-green-600 dark:text-green-400">
                    {field === "messages"
                      ? (item.new[field] as string[]).join(", ")
                      : String(item.new[field as keyof MessageGroupData] || "-")}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
