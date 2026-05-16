import { AuditProgress } from "@/types/api";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useConfig from "./useConfig";

export default function useAnalysisSocket(
  repositoryId: string | undefined,
  onComplete?: (data: any) => void,
  onError?: (data: any) => void,
) {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const [progress, setProgress] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<AuditProgress[]>([]);

  const config = useConfig();

  useEffect(() => {
    if (!repositoryId || !config) return;

    const socket = io(config.api_endpoint, {
      auth: {
        repository_id: repositoryId,
      },
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to analysis socket");
    });

    socket.on("initial_progress", ({ progress }: { progress: number }) => {
      console.log("Initial progress:", progress);
      setProgress(progress);
    });

    socket.on("progress", (data: AuditProgress) => {
      if (data.progress_percent) {
        console.log("Progress update:", data.progress_percent, data.level, data.logger, data.message, data.progress_stage);
        setProgress(data.progress_percent);
      }

      setAuditLogs((prevLogs) => [...prevLogs, data]);
    });

    socket.on(
      "done",
      (data: {
        is_terminal: true;
        level: "INFO" | "ERROR" | "CRITICAL";
        logger: string;
        message: string;
        timestamp: string;
      }) => {
        onComplete?.(data);
      },
    );

    socket.on(
      "error",
      (data: {
        is_terminal: true;
        level: "INFO" | "ERROR" | "CRITICAL";
        logger: string;
        message: string;
        timestamp: string;
      }) => {
        onError?.(data);
      },
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [repositoryId, config]);

  return { progress, auditLogs };
}
