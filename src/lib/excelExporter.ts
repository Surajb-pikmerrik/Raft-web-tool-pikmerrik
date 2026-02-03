import * as XLSX from "xlsx";
import type { ParsedARXMLData } from "./arxmlParser";

export function exportToExcel(data: ParsedARXMLData) {
  const workbook = XLSX.utils.book_new();

  // Signals Sheet
  const signalsData = data.signals.map((signal) => ({
    "Signal Name": signal.name,
    "Port Interface": signal.portInterface || "N/A",
    "PDU Name": signal.pduName || "N/A",
    "Start Position (bits)": signal.startPosition,
    "Length (bits)": signal.length,
    "Byte Order": signal.byteOrder,
    "Data Type": signal.dataType,
    "Init Value": signal.initValue || "N/A",
    "Min Value": signal.minValue || "N/A",
    "Max Value": signal.maxValue || "N/A",
    "Factor": signal.factor || "N/A",
    "Offset": signal.offset || "N/A",
    "Description": signal.description || "N/A",
  }));
  const signalsSheet = XLSX.utils.json_to_sheet(signalsData);
  XLSX.utils.book_append_sheet(workbook, signalsSheet, "Signals");

  // Messages Sheet
  const messagesData = data.messages.map((message) => ({
    "Frame Name": message.frameName || "N/A",
    "PDU Name": message.name,
    "CAN ID (Hex)": message.canIdHex || "N/A",
    "PDU Type": message.pduType,
    "Direction": message.direction || "N/A",
    "Addressing": message.canAddressingMode || message.addressingFormat || "N/A",
    "Type": message.type,
    "Cycle Time (ms)": message.cycleTime || "N/A",
    "Length (bytes)": message.length,
    "Signal Count": message.signals.length,
    "Signals": message.signals.join("\n"),
    "Description": message.description || "N/A",
  }));
  const messagesSheet = XLSX.utils.json_to_sheet(messagesData);
  messagesSheet['!cols'] = [
    { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 40 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, messagesSheet, "Messages");

  // Signal Groups Sheet
  const signalGroupsData = data.signalGroups.map((group) => ({
    "Signal Group Name": group.name,
    "Port Interface": group.portInterface || "N/A",
    "Signals Count": group.signals.length,
    "Signals": group.signals.join("\n"),
    "Description": group.description || "N/A",
  }));
  const signalGroupsSheet = XLSX.utils.json_to_sheet(signalGroupsData);
  signalGroupsSheet['!cols'] = [
    { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, signalGroupsSheet, "Signal Groups");

  // Message Groups Sheet
  const messageGroupsData = data.messageGroups.map((group) => ({
    "Message Group Name": group.name,
    "Messages Count": group.messages.length,
    "Messages": group.messages.join("\n"),
    "Description": group.description || "N/A",
  }));
  const messageGroupsSheet = XLSX.utils.json_to_sheet(messageGroupsData);
  messageGroupsSheet['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, messageGroupsSheet, "Message Groups");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const filename = `ECU_Extract_Parsed_${timestamp}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);
}
