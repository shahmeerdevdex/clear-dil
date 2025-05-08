"use client";

import { useEffect, useRef } from "react";
import BpmnJS from "bpmn-js";

const BpmnViewer = ({ xml }: { xml: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerRef = useRef<BpmnJS | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize BPMN viewer
    bpmnViewerRef.current = new BpmnJS({
      container: containerRef.current,
    });

    // Load BPMN XML
    if (xml) {
      bpmnViewerRef.current.importXML(xml).catch((err) => {
        console.error("Error loading BPMN diagram:", err);
      });
    }

    return () => {
      bpmnViewerRef.current?.destroy();
    };
  }, [xml]);

  return <div ref={containerRef} style={{ width: "100%", height: "550px" }} />;
};

export default BpmnViewer;
