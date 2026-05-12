"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from './dashboard/Header';
import { OverviewMetrics } from './dashboard/OverviewMetrics';
import { TrendsChart } from './dashboard/TrendsChart';
import { NotificationsFeed, Notification } from './dashboard/NotificationsFeed';
import { QuickWins } from './dashboard/QuickWins';
import { FileStructure } from './dashboard/FileStructure';
import { AuditHistory } from './dashboard/AuditHistory';
import { SecurityAudit } from './dashboard/SecurityAudit';
import { RefactorLab } from './dashboard/RefactorLab';
import { FullReportModal } from './dashboard/FullReportModal';
import { FullAuditReport, TimelineHistory } from '@/types/schemas';

// interface DashboardProps {
//   report: FullAuditReport;
//   timelineHistory: TimelineHistory;
//   trendData: Array<{ day: string, debt: number, score: number }>;
//   radarData: Array<{ subject: string, A: number, fullMark: number }>;
//   notifications: Notification[];
//   isResyncing: boolean;
//   onResync: () => void;
//   refactorDiff: {
//     header: string;
//     reasoning: string;
//     before: string;
//     after: string;
//   };
// }

type DashboardProps = {
  repository_id: string;
}

export function Dashboard({ 
  repository_id
}: DashboardProps) {
  const [showFullReport, setShowFullReport] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'debt' | 'score'>('debt');

  return (
    <div className="min-h-screen bg-surface p-6 md:p-12">
      {/* <div className="max-w-7xl mx-auto">
        <Header 
          report={report} 
          isResyncing={isResyncing} 
          onResync={onResync} 
          onFullReport={() => setShowFullReport(true)} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          <OverviewMetrics report={report} radarData={radarData} />
          
          <TrendsChart 
            trendData={trendData} 
            activeMetric={activeMetric} 
            setActiveMetric={setActiveMetric} 
          />

          <NotificationsFeed notifications={notifications} />
          <QuickWins report={report} />

          <AuditHistory history={timelineHistory} />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-black/40 border-white/5 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-active:bg-primary data-active:text-white">Structural Map</TabsTrigger>
            <TabsTrigger value="refactor" className="data-active:bg-primary data-active:text-white">AI Refactor Lab</TabsTrigger>
            <TabsTrigger value="security" className="data-active:bg-primary data-active:text-white">Security Audit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <FileStructure report={report} />
          </TabsContent>

          <TabsContent value="refactor" className="mt-6">
            <RefactorLab diff={refactorDiff} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityAudit report={report} />
          </TabsContent>
        </Tabs>
      </div>

      <FullReportModal 
        isOpen={showFullReport} 
        onClose={() => setShowFullReport(false)} 
        report={report} 
      /> */}
    </div>
  );
}
