import { LayoutDashboard, History, Maximize2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FullAuditReport } from '@/types/schemas';

interface HeaderProps {
  report: FullAuditReport;
  isResyncing: boolean;
  onResync: () => void;
  onFullReport: () => void;
}

export function Header({ report, isResyncing, onResync, onFullReport }: HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <LayoutDashboard className="text-primary" />
          Portfolio Intelligence
        </h1>
        <p className="text-white/40 mt-1">
          Repo: <span className="text-primary">{report.deterministic_report.repository_summary.name}</span> • 
          Last Analyzed: {new Date(report.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onResync}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          disabled={isResyncing}
        >
          <History size={16} className={cn(isResyncing && "animate-spin")} />
          {isResyncing ? 'Analyzing...' : 'Re-sync'}
        </button>
        <button 
          onClick={onFullReport}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <Maximize2 size={16} />
          Full Report
        </button>
      </div>
    </div>
  );
}
