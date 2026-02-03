import type { ParsedARXMLData, MessageData, SignalData, SignalGroupData, MessageGroupData } from "./arxmlParser";

export interface ModifiedItem<T> {
  old: T;
  new: T;
  changes: string[];
}

export interface ComparisonResult {
  added: {
    messages: MessageData[];
    signals: SignalData[];
    signalGroups: SignalGroupData[];
    messageGroups: MessageGroupData[];
  };
  deleted: {
    messages: MessageData[];
    signals: SignalData[];
    signalGroups: SignalGroupData[];
    messageGroups: MessageGroupData[];
  };
  modified: {
    messages: ModifiedItem<MessageData>[];
    signals: ModifiedItem<SignalData>[];
    signalGroups: ModifiedItem<SignalGroupData>[];
    messageGroups: ModifiedItem<MessageGroupData>[];
  };
}

function compareItems<T extends { name: string }>(
  baseItems: T[],
  newItems: T[],
  compareFields: (keyof T)[]
): {
  added: T[];
  deleted: T[];
  modified: ModifiedItem<T>[];
} {
  const added: T[] = [];
  const deleted: T[] = [];
  const modified: ModifiedItem<T>[] = [];

  const baseMap = new Map(baseItems.map(item => [item.name, item]));
  const newMap = new Map(newItems.map(item => [item.name, item]));

  // Find added items
  newItems.forEach(newItem => {
    if (!baseMap.has(newItem.name)) {
      added.push(newItem);
    }
  });

  // Find deleted items
  baseItems.forEach(baseItem => {
    if (!newMap.has(baseItem.name)) {
      deleted.push(baseItem);
    }
  });

  // Find modified items
  baseItems.forEach(baseItem => {
    const newItem = newMap.get(baseItem.name);
    if (newItem) {
      const changes: string[] = [];
      
      compareFields.forEach(field => {
        const baseValue = baseItem[field];
        const newValue = newItem[field];
        
        if (JSON.stringify(baseValue) !== JSON.stringify(newValue)) {
          changes.push(field as string);
        }
      });

      if (changes.length > 0) {
        modified.push({
          old: baseItem,
          new: newItem,
          changes
        });
      }
    }
  });

  return { added, deleted, modified };
}

export function compareEcuExtracts(
  baseData: ParsedARXMLData,
  newData: ParsedARXMLData
): ComparisonResult {
  // Compare messages
  const messageFields: (keyof MessageData)[] = [
    "frameName", "canIdHex", "canId", "pduType", "direction",
    "canAddressingMode", "addressingFormat", "type", "cycleTime",
    "length", "description"
  ];
  const messagesComparison = compareItems(baseData.messages, newData.messages, messageFields);

  // Compare signals
  const signalFields: (keyof SignalData)[] = [
    "pduName", "startPosition", "length", "byteOrder", "dataType",
    "initValue", "minValue", "maxValue", "description"
  ];
  const signalsComparison = compareItems(baseData.signals, newData.signals, signalFields);

  // Compare signal groups
  const signalGroupFields: (keyof SignalGroupData)[] = ["signals", "description"];
  const signalGroupsComparison = compareItems(baseData.signalGroups, newData.signalGroups, signalGroupFields);

  // Compare message groups
  const messageGroupFields: (keyof MessageGroupData)[] = ["messages", "description"];
  const messageGroupsComparison = compareItems(baseData.messageGroups, newData.messageGroups, messageGroupFields);

  return {
    added: {
      messages: messagesComparison.added,
      signals: signalsComparison.added,
      signalGroups: signalGroupsComparison.added,
      messageGroups: messageGroupsComparison.added,
    },
    deleted: {
      messages: messagesComparison.deleted,
      signals: signalsComparison.deleted,
      signalGroups: signalGroupsComparison.deleted,
      messageGroups: messageGroupsComparison.deleted,
    },
    modified: {
      messages: messagesComparison.modified,
      signals: signalsComparison.modified,
      signalGroups: signalGroupsComparison.modified,
      messageGroups: messageGroupsComparison.modified,
    },
  };
}
