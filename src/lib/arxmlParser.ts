export interface SignalData {
  name: string;
  pduName: string;
  startPosition: number;
  length: number;
  byteOrder: string;
  dataType: string;
  initValue?: string;
  description?: string;
  minValue?: string;
  maxValue?: string;
  factor?: string;
  offset?: string;
  portInterface?: string;
}

export interface MessageData {
  name: string;
  frameName?: string;
  type: "Periodic" | "Spontaneous";
  cycleTime?: number;
  length: number;
  signals: string[];
  description?: string;
  pduType: string;
  direction?: string;
  addressingFormat?: string;
  canId?: number;
  canIdHex?: string;
  canAddressingMode?: string;
  canFrameBehavior?: string;
}

export interface SignalGroupData {
  name: string;
  signals: string[];
  description?: string;
  portInterface?: string;
}

export interface MessageGroupData {
  name: string;
  messages: string[];
  description?: string;
}

export interface ParsedARXMLData {
  signals: SignalData[];
  messages: MessageData[];
  signalGroups: SignalGroupData[];
  messageGroups: MessageGroupData[];
}

export function parseARXMLFile(xmlText: string): ParsedARXMLData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML format");
  }

  const signals: SignalData[] = [];
  const messages: MessageData[] = [];
  const signalGroups: SignalGroupData[] = [];
  const messageGroups: MessageGroupData[] = [];

  // Parse Signal Min/Max/Factor/Offset values from COMPU-METHOD's COMPU-SCALE
  // Only extract from LINEAR scales (those with COMPU-RATIONAL-COEFFS), not text-table entries (ERR, RES, SNA)
  const compuMethodData = new Map<string, { min?: string; max?: string; factor?: string; offset?: string }>();
  const compuMethods = xmlDoc.querySelectorAll("COMPU-METHOD");
  compuMethods.forEach((compuMethod) => {
    const name = compuMethod.querySelector("SHORT-NAME")?.textContent || "";
    const category = compuMethod.querySelector("CATEGORY")?.textContent || "";
    
    // Get all COMPU-SCALE elements
    const compuScales = compuMethod.querySelectorAll("COMPU-INTERNAL-TO-PHYS COMPU-SCALES COMPU-SCALE");
    let linearMin: number | undefined;
    let linearMax: number | undefined;
    let factor: number | undefined;
    let offset: number | undefined;
    
    // First pass: look for LINEAR scales (those with COMPU-RATIONAL-COEFFS)
    compuScales.forEach((scale) => {
      // Check if this scale has COMPU-RATIONAL-COEFFS (linear conversion scale)
      const rationalCoeffs = scale.querySelector("COMPU-RATIONAL-COEFFS");
      
      if (rationalCoeffs) {
        // This is a linear scale - extract its limits as the valid min/max
        const lowerLimit = scale.querySelector("LOWER-LIMIT")?.textContent;
        const upperLimit = scale.querySelector("UPPER-LIMIT")?.textContent;
        
        if (lowerLimit !== null && lowerLimit !== undefined) {
          const lowerVal = parseFloat(lowerLimit);
          if (!isNaN(lowerVal)) {
            if (linearMin === undefined || lowerVal < linearMin) {
              linearMin = lowerVal;
            }
          }
        }
        
        if (upperLimit !== null && upperLimit !== undefined) {
          const upperVal = parseFloat(upperLimit);
          if (!isNaN(upperVal)) {
            if (linearMax === undefined || upperVal > linearMax) {
              linearMax = upperVal;
            }
          }
        }
        
        // Extract Factor and Offset from COMPU-RATIONAL-COEFFS
        // Physical = (Raw * Numerator[1] + Numerator[0]) / Denominator[0]
        // Factor = Numerator[1] / Denominator[0], Offset = Numerator[0] / Denominator[0]
        if (factor === undefined && offset === undefined) {
          const numeratorVs = rationalCoeffs.querySelectorAll("COMPU-NUMERATOR V");
          const denominatorVs = rationalCoeffs.querySelectorAll("COMPU-DENOMINATOR V");
          
          if (numeratorVs.length >= 2 && denominatorVs.length >= 1) {
            const num0 = parseFloat(numeratorVs[0].textContent || "0"); // Offset numerator
            const num1 = parseFloat(numeratorVs[1].textContent || "1"); // Factor numerator
            const denom = parseFloat(denominatorVs[0].textContent || "1"); // Denominator
            
            if (!isNaN(num0) && !isNaN(num1) && !isNaN(denom) && denom !== 0) {
              factor = num1 / denom;
              offset = num0 / denom;
            }
          }
        }
      }
    });
    
    // If no linear scales found, check if this is a TEXTTABLE method
    // For TEXTTABLE, extract min/max from ALL COMPU-SCALE entries (including COMPU-CONST)
    if (linearMin === undefined && linearMax === undefined && category === "TEXTTABLE") {
      compuScales.forEach((scale) => {
        const lowerLimit = scale.querySelector("LOWER-LIMIT")?.textContent;
        const upperLimit = scale.querySelector("UPPER-LIMIT")?.textContent;
        
        if (lowerLimit !== null && lowerLimit !== undefined) {
          const lowerVal = parseFloat(lowerLimit);
          if (!isNaN(lowerVal)) {
            if (linearMin === undefined || lowerVal < linearMin) {
              linearMin = lowerVal;
            }
          }
        }
        
        if (upperLimit !== null && upperLimit !== undefined) {
          const upperVal = parseFloat(upperLimit);
          if (!isNaN(upperVal)) {
            if (linearMax === undefined || upperVal > linearMax) {
              linearMax = upperVal;
            }
          }
        }
      });
    }
    
    // Fallback for other methods (IDENTICAL, etc.) - skip COMPU-CONST entries
    if (linearMin === undefined && linearMax === undefined) {
      compuScales.forEach((scale) => {
        // Skip text-table entries (those with COMPU-CONST and no coefficients)
        const hasCompuConst = scale.querySelector("COMPU-CONST");
        if (hasCompuConst) return;
        
        const lowerLimit = scale.querySelector("LOWER-LIMIT")?.textContent;
        const upperLimit = scale.querySelector("UPPER-LIMIT")?.textContent;
        
        if (lowerLimit !== null && lowerLimit !== undefined) {
          const lowerVal = parseFloat(lowerLimit);
          if (!isNaN(lowerVal)) {
            if (linearMin === undefined || lowerVal < linearMin) {
              linearMin = lowerVal;
            }
          }
        }
        
        if (upperLimit !== null && upperLimit !== undefined) {
          const upperVal = parseFloat(upperLimit);
          if (!isNaN(upperVal)) {
            if (linearMax === undefined || upperVal > linearMax) {
              linearMax = upperVal;
            }
          }
        }
      });
    }
    
    if (name && (linearMin !== undefined || linearMax !== undefined || factor !== undefined || offset !== undefined)) {
      compuMethodData.set(name, {
        min: linearMin !== undefined ? linearMin.toString() : undefined,
        max: linearMax !== undefined ? linearMax.toString() : undefined,
        factor: factor !== undefined ? factor.toString() : undefined,
        offset: offset !== undefined ? offset.toString() : undefined
      });
    }
  });

  // Build SYSTEM-SIGNAL to COMPU-METHOD mapping
  const systemSignalToCompuMethodMap = new Map<string, string>();
  const systemSignals = xmlDoc.querySelectorAll("SYSTEM-SIGNAL");
  systemSignals.forEach((sysSignal) => {
    const shortName = sysSignal.querySelector("SHORT-NAME")?.textContent || "";
    // Look for COMPU-METHOD-REF in PHYSICAL-PROPS
    const compuMethodRef = sysSignal.querySelector(
      "PHYSICAL-PROPS SW-DATA-DEF-PROPS-VARIANTS SW-DATA-DEF-PROPS-CONDITIONAL COMPU-METHOD-REF"
    )?.textContent?.split("/").pop() || "";
    
    if (shortName && compuMethodRef) {
      systemSignalToCompuMethodMap.set(shortName, compuMethodRef);
    }
  });

  // Parse I-SIGNAL-TRIGGERING for cycle time information
  const signalTriggerMap = new Map<string, { launchType: string; cycleTime?: number }>();
  const iSignalTriggerings = xmlDoc.querySelectorAll("I-SIGNAL-TRIGGERING");
  iSignalTriggerings.forEach((triggering) => {
    const signalRef = triggering.querySelector("I-SIGNAL-REF");
    const adminData = triggering.querySelector("ADMIN-DATA");
    
    if (signalRef && adminData) {
      const signalName = signalRef.textContent?.split("/").pop() || "";
      
      // Navigate through ADMIN-DATA > SDGS > SDG[GID="XDISTransmissionAttributes"]
      const sdgs = adminData.querySelector("SDGS");
      if (sdgs) {
        const xdisSDG = Array.from(sdgs.querySelectorAll("SDG")).find(
          sdg => sdg.getAttribute("GID") === "XDISTransmissionAttributes"
        );
        
        if (xdisSDG) {
          const launchTypeSD = Array.from(xdisSDG.querySelectorAll("SD")).find(
            sd => sd.getAttribute("GID") === "LaunchType"
          );
          const cycleTimeSD = Array.from(xdisSDG.querySelectorAll("SD")).find(
            sd => sd.getAttribute("GID") === "CycleTime"
          );
          
          const launchType = launchTypeSD?.textContent || "Spontaneous";
          // CycleTime is already in milliseconds, no conversion needed
          const cycleTime = cycleTimeSD ? parseFloat(cycleTimeSD.textContent || "0") : undefined;
          
          signalTriggerMap.set(signalName, {
            launchType,
            cycleTime
          });
        }
      }
    }
  });

  // Parse SENDER-RECEIVER-TO-SIGNAL-MAPPING for port interface extraction
  const systemSignalToPortInterface = new Map<string, string>();
  const senderReceiverSignalMappings = xmlDoc.querySelectorAll("SENDER-RECEIVER-TO-SIGNAL-MAPPING");
  senderReceiverSignalMappings.forEach((mapping) => {
    const systemSignalRef = mapping.querySelector("SYSTEM-SIGNAL-REF")?.textContent || "";
    const targetDataPrototypeRef = mapping.querySelector("TARGET-DATA-PROTOTYPE-REF")?.textContent || "";
    
    if (systemSignalRef && targetDataPrototypeRef) {
      const systemSignalName = systemSignalRef.split("/").pop() || "";
      // Port interface is the second-to-last segment in the path
      const pathParts = targetDataPrototypeRef.split("/").filter(p => p);
      const portInterfaceName = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
      
      if (systemSignalName && portInterfaceName) {
        systemSignalToPortInterface.set(systemSignalName, portInterfaceName);
      }
    }
  });

  // Parse SENDER-RECEIVER-TO-SIGNAL-GROUP-MAPPING for signal group port interface extraction
  const signalGroupToPortInterface = new Map<string, string>();
  const senderReceiverGroupMappings = xmlDoc.querySelectorAll("SENDER-RECEIVER-TO-SIGNAL-GROUP-MAPPING");
  senderReceiverGroupMappings.forEach((mapping) => {
    const signalGroupRef = mapping.querySelector("SIGNAL-GROUP-REF")?.textContent || "";
    const targetDataPrototypeRef = mapping.querySelector("TARGET-DATA-PROTOTYPE-REF")?.textContent || "";
    
    if (signalGroupRef && targetDataPrototypeRef) {
      const signalGroupName = signalGroupRef.split("/").pop() || "";
      // Port interface is the second-to-last segment in the path
      const pathParts = targetDataPrototypeRef.split("/").filter(p => p);
      const portInterfaceName = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : "";
      
      if (signalGroupName && portInterfaceName) {
        signalGroupToPortInterface.set(signalGroupName, portInterfaceName);
      }
    }
  });

  // Build I-SIGNAL name to SYSTEM-SIGNAL name mapping
  const iSignalToSystemSignal = new Map<string, string>();

  // Parse I-Signals
  const iSignals = xmlDoc.querySelectorAll("I-SIGNAL");
  const signalToPduMap = new Map<string, string>();
  const signalToStartPosMap = new Map<string, number>();
  const signalToByteOrderMap = new Map<string, string>();

  // Parse signal mappings by traversing from parent I-SIGNAL-I-PDU elements
  const iSignalIPdus = xmlDoc.querySelectorAll("I-SIGNAL-I-PDU");
  iSignalIPdus.forEach((pdu) => {
    // Get PDU name from parent's SHORT-NAME (direct child only)
    const pduName = pdu.querySelector(":scope > SHORT-NAME")?.textContent || "";
    
    // Find all signal mappings within this PDU
    const mappings = pdu.querySelectorAll("I-SIGNAL-TO-I-PDU-MAPPING");
    mappings.forEach((mapping) => {
      const signalRef = mapping.querySelector("I-SIGNAL-REF");
      const startPos = mapping.querySelector("START-POSITION");
      const packingByteOrder = mapping.querySelector("PACKING-BYTE-ORDER");
      
      if (signalRef) {
        const signalName = signalRef.textContent?.split("/").pop() || "";
        signalToPduMap.set(signalName, pduName);
        
        if (startPos) {
          signalToStartPosMap.set(signalName, parseInt(startPos.textContent || "0"));
        }
        if (packingByteOrder) {
          signalToByteOrderMap.set(signalName, packingByteOrder.textContent || "MOST-SIGNIFICANT-BYTE-LAST");
        }
      }
    });
  });

  iSignals.forEach((signal) => {
    const shortName = signal.querySelector("SHORT-NAME")?.textContent || "";
    const length = signal.querySelector("LENGTH")?.textContent || "0";
    const initValue = signal.querySelector("INIT-VALUE VALUE")?.textContent || "";
    const description = signal.querySelector("DESC L-2")?.textContent || "";
    const baseType = signal.querySelector("BASE-TYPE-REF")?.textContent?.split("/").pop() || "";
    
    // PRIMARY: Follow the chain I-SIGNAL → SYSTEM-SIGNAL-REF → SYSTEM-SIGNAL → COMPU-METHOD-REF → COMPU-METHOD
    const systemSignalRef = signal.querySelector("SYSTEM-SIGNAL-REF")?.textContent?.split("/").pop() || "";
    
    // Store I-SIGNAL to SYSTEM-SIGNAL mapping for port interface lookup
    if (systemSignalRef) {
      iSignalToSystemSignal.set(shortName, systemSignalRef);
    }
    
    let compuMethodName = systemSignalRef ? systemSignalToCompuMethodMap.get(systemSignalRef) : undefined;
    
    // FALLBACK 1: Check for COMPU-METHOD-REF directly on I-SIGNAL
    if (!compuMethodName) {
      const directCompuRef = signal.querySelector("COMPU-METHOD-REF")?.textContent?.split("/").pop();
      if (directCompuRef) {
        compuMethodName = directCompuRef;
      }
    }
    
    // FALLBACK 2: Check NETWORK-REPRESENTATION-PROPS for COMPU-METHOD-REF
    if (!compuMethodName) {
      const networkPropsCompuRef = signal.querySelector(
        "NETWORK-REPRESENTATION-PROPS SW-DATA-DEF-PROPS-VARIANTS SW-DATA-DEF-PROPS-CONDITIONAL COMPU-METHOD-REF"
      )?.textContent?.split("/").pop();
      if (networkPropsCompuRef) {
        compuMethodName = networkPropsCompuRef;
      }
    }
    
    // FALLBACK 3: Try matching by signal name directly
    if (!compuMethodName && compuMethodData.has(shortName)) {
      compuMethodName = shortName;
    }
    
    // Get constraints from COMPU-METHOD, default to 0 if not found
    const compuData = compuMethodName ? compuMethodData.get(compuMethodName) : undefined;
    const minValue = compuData?.min ?? "0";
    const maxValue = compuData?.max ?? "0";
    const factor = compuData?.factor;
    const offset = compuData?.offset;

    // Get port interface from SYSTEM-SIGNAL mapping
    const portInterface = systemSignalRef ? systemSignalToPortInterface.get(systemSignalRef) : undefined;

    signals.push({
      name: shortName,
      pduName: signalToPduMap.get(shortName) || "",
      startPosition: signalToStartPosMap.get(shortName) || 0,
      length: parseInt(length),
      byteOrder: signalToByteOrderMap.get(shortName) === "MOST-SIGNIFICANT-BYTE-FIRST" ? "Big-Endian" : "Little-Endian",
      dataType: baseType,
      initValue,
      description,
      minValue,
      maxValue,
      factor,
      offset,
      portInterface
    });
  });

  // Parse CAN-FRAME-TRIGGERING for CAN identifiers
  const canFrameData = new Map<string, { canId: number; canIdHex: string; addressingMode: string; frameBehavior: string }>();
  const canFrameTriggerings = xmlDoc.querySelectorAll("CAN-FRAME-TRIGGERING");
  canFrameTriggerings.forEach((frameTriggering) => {
    const frameRef = frameTriggering.querySelector("FRAME-REF");
    const identifier = frameTriggering.querySelector("IDENTIFIER");
    const addressingMode = frameTriggering.querySelector("CAN-ADDRESSING-MODE");
    const txBehavior = frameTriggering.querySelector("CAN-FRAME-TX-BEHAVIOR");
    const rxBehavior = frameTriggering.querySelector("CAN-FRAME-RX-BEHAVIOR");
    
    if (frameRef && identifier) {
      const frameName = frameRef.textContent?.split("/").pop() || "";
      const canId = parseInt(identifier.textContent || "0");
      const canIdHex = "0x" + canId.toString(16).toUpperCase();
      const mode = addressingMode?.textContent || "STANDARD";
      const behavior = txBehavior?.textContent || rxBehavior?.textContent || "CAN";
      
      canFrameData.set(frameName, {
        canId,
        canIdHex,
        addressingMode: mode,
        frameBehavior: behavior
      });
    }
  });

  // Build port-to-direction map from I-PDU-PORT elements
  const portToDirectionMap = new Map<string, string>();
  const iPduPorts = xmlDoc.querySelectorAll("I-PDU-PORT");
  iPduPorts.forEach((port) => {
    const shortName = port.querySelector("SHORT-NAME")?.textContent || "";
    const direction = port.querySelector("COMMUNICATION-DIRECTION")?.textContent || "";
    if (shortName && direction) {
      portToDirectionMap.set(shortName, direction === "OUT" ? "Tx" : "Rx");
    }
  });

  // Parse PDU-TRIGGERING to link PDUs to frames AND directions
  const pduToFrameMap = new Map<string, string>();
  const pduToDirectionMap = new Map<string, string>();
  const pduTriggerings = xmlDoc.querySelectorAll("PDU-TRIGGERING");
  
  pduTriggerings.forEach((pduTriggering) => {
    const pduRef = pduTriggering.querySelector("I-PDU-REF");
    if (pduRef) {
      const pduName = pduRef.textContent?.split("/").pop() || "";
      const pduTriggeringShortName = pduTriggering.querySelector("SHORT-NAME")?.textContent || "";
      
      // Extract direction from I-PDU-PORT-REF
      const portRefs = pduTriggering.querySelectorAll("I-PDU-PORT-REFS I-PDU-PORT-REF");
      portRefs.forEach((portRef) => {
        const portPath = portRef.textContent || "";
        const portName = portPath.split("/").pop() || "";
        const direction = portToDirectionMap.get(portName);
        if (direction && pduName) {
          pduToDirectionMap.set(pduName, direction);
        }
      });
      
      // Find the corresponding frame through CAN-FRAME-TRIGGERING's PDU-TRIGGERING-REF
      canFrameTriggerings.forEach((frameTriggering) => {
        const pduTriggerRef = frameTriggering.querySelector("PDU-TRIGGERING-REF");
        if (pduTriggerRef && pduTriggerRef.textContent?.includes(pduTriggeringShortName)) {
          const frameRef = frameTriggering.querySelector("FRAME-REF");
          if (frameRef) {
            const frameName = frameRef.textContent?.split("/").pop() || "";
            pduToFrameMap.set(pduName, frameName);
          }
        }
      });
    }
  });

  // Parse addressing format from CAN-TP-CONNECTION
  const pduAddressingFormat = new Map<string, string>();
  const canTpConnections = xmlDoc.querySelectorAll("CAN-TP-CONNECTION");
  canTpConnections.forEach((connection) => {
    const addressingFormat = connection.querySelector("ADDRESSING-FORMAT")?.textContent || "";
    const dataPduRef = connection.querySelector("DATA-PDU-REF")?.textContent?.split("/").pop() || "";
    const tpSduRef = connection.querySelector("TP-SDU-REF")?.textContent?.split("/").pop() || "";
    
    if (addressingFormat && dataPduRef) {
      pduAddressingFormat.set(dataPduRef, addressingFormat);
    }
    if (addressingFormat && tpSduRef) {
      pduAddressingFormat.set(tpSduRef, addressingFormat);
    }
  });

  // Parse NM-PDU cycle times from CAN-NM-CLUSTER
  const nmPduCycleTimeMap = new Map<string, number>();
  const canNmClusters = xmlDoc.querySelectorAll("CAN-NM-CLUSTER");
  canNmClusters.forEach((cluster) => {
    // Get NM-MSG-CYCLE-TIME (value is in seconds)
    const nmMsgCycleTimeElement = cluster.querySelector("NM-MSG-CYCLE-TIME");
    const nmMsgCycleTime = nmMsgCycleTimeElement 
      ? parseFloat(nmMsgCycleTimeElement.textContent || "0") * 1000 // Convert to ms
      : undefined;
    
    if (nmMsgCycleTime) {
      // Find all NM-PDU references in CAN-NM-NODE elements
      const canNmNodes = cluster.querySelectorAll("CAN-NM-NODE");
      canNmNodes.forEach((node) => {
        // Get TX NM-PDU references
        const txNmPduRefs = node.querySelectorAll("TX-NM-PDU-REFS TX-NM-PDU-REF");
        txNmPduRefs.forEach((ref) => {
          const pduName = ref.textContent?.split("/").pop() || "";
          if (pduName) {
            nmPduCycleTimeMap.set(pduName, nmMsgCycleTime);
          }
        });
        
        // Get RX NM-PDU references
        const rxNmPduRefs = node.querySelectorAll("RX-NM-PDU-REFS RX-NM-PDU-REF");
        rxNmPduRefs.forEach((ref) => {
          const pduName = ref.textContent?.split("/").pop() || "";
          if (pduName) {
            nmPduCycleTimeMap.set(pduName, nmMsgCycleTime);
          }
        });
      });
    }
  });

  // Parse All PDU Types (I-SIGNAL-I-PDU, DCM-I-PDU, NM-PDU, N-PDU, etc.)
  const pduTypes = ["I-SIGNAL-I-PDU", "DCM-I-PDU", "NM-PDU", "N-PDU", "CONTAINER-I-PDU", "MULTIPLEXED-I-PDU", "GENERAL-PURPOSE-I-PDU"];
  
  pduTypes.forEach((pduType) => {
    const pdus = xmlDoc.querySelectorAll(pduType);
    pdus.forEach((pdu) => {
      const shortName = pdu.querySelector("SHORT-NAME")?.textContent || "";
      const length = pdu.querySelector("LENGTH")?.textContent || "0";
      const description = pdu.querySelector("DESC L-2")?.textContent || "";

      // Find signals in this PDU
      const pduSignals = signals.filter((sig) => sig.pduName === shortName).map((sig) => sig.name);

      // Check if periodic or spontaneous - check from signal triggering first
      let isPeriodic = false;
      let cycleTime: number | undefined;

      // Check if any signals in this PDU have triggering info
      for (const signalName of pduSignals) {
        const triggerInfo = signalTriggerMap.get(signalName);
        if (triggerInfo) {
          if (triggerInfo.launchType === "Cyclic") {
            isPeriodic = true;
            cycleTime = triggerInfo.cycleTime; // Already in ms
            break;
          }
        }
      }

      // Fallback 1: Try to find cycle time from CYCLIC-TIMING in PDU
      if (!isPeriodic) {
        const cyclicTiming = pdu.querySelector("CYCLIC-TIMING REPEATING-TIME VALUE");
        if (cyclicTiming) {
          isPeriodic = true;
          // CYCLIC-TIMING value is in seconds, convert to ms
          cycleTime = parseFloat(cyclicTiming.textContent || "0") * 1000;
        }
      }

      // Fallback 2: For NM-PDU, check the nmPduCycleTimeMap from CAN-NM-CLUSTER
      if (!isPeriodic && pduType === "NM-PDU") {
        const nmCycleTime = nmPduCycleTimeMap.get(shortName);
        if (nmCycleTime !== undefined) {
          isPeriodic = true;
          cycleTime = nmCycleTime;
        }
      }

      // Find direction for this PDU using the correct mapping
      const direction = pduToDirectionMap.get(shortName);

      // Find addressing format
      const addressingFormat = pduAddressingFormat.get(shortName);

      // Find CAN identifier through frame mapping
      const frameName = pduToFrameMap.get(shortName);
      const canData = frameName ? canFrameData.get(frameName) : undefined;

      messages.push({
        name: shortName,
        frameName,
        type: isPeriodic ? "Periodic" : "Spontaneous",
        cycleTime,
        length: parseInt(length),
        signals: pduSignals,
        description,
        pduType: pduType,
        direction,
        addressingFormat,
        canId: canData?.canId,
        canIdHex: canData?.canIdHex,
        canAddressingMode: canData?.addressingMode,
        canFrameBehavior: canData?.frameBehavior
      });
    });
  });

  // Parse Signal Groups (I-SIGNAL-GROUP)
  const iSignalGroups = xmlDoc.querySelectorAll("I-SIGNAL-GROUP");
  iSignalGroups.forEach((group) => {
    const shortName = group.querySelector("SHORT-NAME")?.textContent || "";
    const description = group.querySelector("DESC L-2")?.textContent || "";
    const signalRefs = group.querySelectorAll("I-SIGNAL-REF");
    
    // Get SYSTEM-SIGNAL-GROUP-REF for port interface lookup
    const systemSignalGroupRef = group.querySelector("SYSTEM-SIGNAL-GROUP-REF")?.textContent?.split("/").pop() || "";
    const portInterface = systemSignalGroupRef ? signalGroupToPortInterface.get(systemSignalGroupRef) : undefined;
    
    const groupSignals: string[] = [];
    signalRefs.forEach((ref) => {
      const sigName = ref.textContent?.split("/").pop();
      if (sigName) groupSignals.push(sigName);
    });

    signalGroups.push({
      name: shortName,
      signals: groupSignals,
      description,
      portInterface,
    });
  });

  // Parse Message Groups (I-SIGNAL-I-PDU-GROUP)
  const iPduGroups = xmlDoc.querySelectorAll("I-SIGNAL-I-PDU-GROUP");
  iPduGroups.forEach((group) => {
    const shortName = group.querySelector("SHORT-NAME")?.textContent || "";
    const description = group.querySelector("DESC L-2")?.textContent || "";
    const pduRefs = group.querySelectorAll("COMMUNICATION-DIRECTION I-PDU-REF, I-PDU-REF");
    
    const groupMessages: string[] = [];
    pduRefs.forEach((ref) => {
      const msgName = ref.textContent?.split("/").pop();
      if (msgName) groupMessages.push(msgName);
    });

    messageGroups.push({
      name: shortName,
      messages: groupMessages,
      description,
    });
  });

  return {
    signals,
    messages,
    signalGroups,
    messageGroups,
  };
}
