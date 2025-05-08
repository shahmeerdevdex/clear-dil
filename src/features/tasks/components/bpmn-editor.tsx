"use client";

import { useEffect, useRef } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";

export const BpmnEditor = ({ xml }: { xml: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    modelerRef.current = new BpmnModeler({
      container: containerRef.current,
    });

    if (xml) {
      modelerRef.current.importXML(xml).catch(console.error);
    }

    return () => {
      modelerRef.current?.destroy();
    };
  }, [xml]);

  return <div ref={containerRef} style={{ width: "100%", height: "550px" }} />;
};
