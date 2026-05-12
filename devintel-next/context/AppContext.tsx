"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// --- Loading Sample Data ---
import ANALYSIS_DATA_RAW from "../analysis_sample.json";
import TIMELINE_DATA_RAW from "../timeline_history_sample.json";
import { FullAuditReport, TimelineHistory } from "@/types/schemas";

// --- Validate and Parse Data ---
const AUDIT_REPORT: FullAuditReport = (ANALYSIS_DATA_RAW as any)
  .full_audit_report;
const TIMELINE_HISTORY: TimelineHistory = (TIMELINE_DATA_RAW as any)
  .timeline_history;

const RADAR_DATA = AUDIT_REPORT.llm_insights.radar_metrics.map((m) => ({
  subject: m.subject,
  A: m.score,
  fullMark: m.max,
}));

const INITIAL_TREND_DATA = TIMELINE_HISTORY.map((item) => ({
  day: new Date(item.timestamp).toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  }),
  debt: item.technical_debt,
  score: item.score,
}));

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  points: string;
  type: "growth" | "system";
}

interface AppContextType {
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  trendData: any[];
  setTrendData: React.Dispatch<React.SetStateAction<any[]>>;
  isResyncing: boolean;
  setIsResyncing: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  report: FullAuditReport;
  timelineHistory: TimelineHistory;
  radarData: any[];
  refactorDiff: any;
  onResync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [trendData, setTrendData] = useState(INITIAL_TREND_DATA);
  const [isResyncing, setIsResyncing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Complexity reduction strategy active",
      desc: AUDIT_REPORT.llm_insights.ai_reasoning.slice(0, 50) + "...",
      time: "2 hours ago",
      points: `+${AUDIT_REPORT.llm_insights.growth_pts}pts`,
      type: "growth",
    },
    {
      id: "2",
      title: `System analysis complete for ${AUDIT_REPORT.deterministic_report.repository_summary.name}`,
      desc: `FULL_AUDIT successfully finalized. job_id: ${AUDIT_REPORT.job_id}`,
      time: "1 day ago",
      points: "SUCCESS",
      type: "system",
    },
  ]);

  const refactorDiff = {
    header: "Violation of SRP (Single Responsibility Principle)",
    reasoning: AUDIT_REPORT.llm_insights.ai_reasoning,
    before: `
async function handleUserOperation(req: Request) {
  const user = await db.users.find(req.id);
  if (!user.token) throw new Error('Unauth');
  const result = await db.orders.create(req.payload);
  await emailService.sendReceipt(user.email, result.id);
  return result;
}`,
    after: `
async function handleUserOperation(req: Request) {
  const user = await authService.authenticate(req.id);
  const order = await orderService.createOrder(req.payload);
  await notificationService.notifyOrderCreated(user, order);
  return order;
}`,
  };

  const handleResync = () => {
    setIsResyncing(true);
    setLogs((prev) => [
      ...prev,
      "Starting Differential Analysis...",
      "Comparing HEAD with previous audit...",
    ]);

    setTimeout(() => {
      const lastPoint = trendData[trendData.length - 1];
      const newPoint = {
        day: "Now",
        debt: Math.max(15, lastPoint.debt - 5),
        score: Math.min(100, lastPoint.score + 3),
      };

      setTrendData((prev) => [...prev, newPoint]);
      setIsResyncing(false);

      const newNote: Notification = {
        id: Date.now().toString(),
        title: "Growth Note: Significant Improvement!",
        desc: "You reduced technical debt in /services by 15% in this session.",
        time: "Just now",
        points: "+3pts",
        type: "growth",
      };

      setNotifications((prev) => [newNote, ...prev.slice(0, 4)]);
    }, 2000);
  };

  return (
    <AppContext.Provider
      value={{
        logs,
        setLogs,
        progress,
        setProgress,
        trendData,
        setTrendData,
        isResyncing,
        setIsResyncing,
        notifications,
        setNotifications,
        report: AUDIT_REPORT,
        timelineHistory: TIMELINE_HISTORY,
        radarData: RADAR_DATA,
        refactorDiff,
        onResync: handleResync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
