import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Activity, CheckCircle2, Lightbulb, BrainCircuit, Download, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { FullAuditReport } from '@/types/schemas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FullReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullAuditReport;
}

export function FullReportModal({ isOpen, onClose, report }: FullReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalStyle;
    }
    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalStyle;
    };
  }, [isOpen]);

    const handleExport = async () => {
      if (!reportRef.current) return;
      
      setIsExporting(true);
      try {
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#111827', 
          onclone: (clonedDoc) => {
            // Ensure any elements that should be hidden during export are hidden
            const elementsToHide = clonedDoc.querySelectorAll('.no-export');
            elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
          }
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Handle multipage if needed, but for simplicity let's fit to width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`audit-report-${report.job_id}.pdf`);
      } catch (error) {
        console.error("PDF Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
          onWheel={(e) => e.stopPropagation()}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-pointer" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-full md:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md z-20 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="text-primary" size={24} />
                  Full Architecture Audit Report
                </h2>
                <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-[0.3em]">JOB ID: {report.job_id}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all transform hover:rotate-90"
              >
                <Maximize2 size={22} className="rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar min-h-0 bg-transparent">
              <div ref={reportRef} className="p-10 pb-24 h-fit">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <section className="space-y-8">
                    <div>
                      <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">Executive Summary</h3>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Overall Score</span>
                          <span className="text-lg font-mono font-bold text-secondary uppercase">{report.llm_insights.overall_score}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono text-white/40">
                            <span>TECHNICAL DEBT</span>
                            <span>{report.llm_insights.technical_debt_score}%</span>
                          </div>
                          <Progress value={report.llm_insights.technical_debt_score} className="h-2 bg-white/5" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">AI Confidence</span>
                          <span className="text-sm font-mono font-bold text-warning">{report.llm_insights.confidence * 100}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">Architectural Recommendation</h3>
                      <div className="space-y-4">
                        {report.llm_insights.architectural_recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                             <Lightbulb className="text-warning shrink-0 mt-1" size={20} />
                             <p className="text-xs leading-relaxed text-white/80">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  
                  <section className="space-y-8">
                    <div>
                       <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">AI Reasoning</h3>
                       <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 relative overflow-hidden group">
                         <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <BrainCircuit size={80} />
                         </div>
                         <p className="text-sm leading-relaxed text-white/80 italic font-medium">
                           "{report.llm_insights.ai_reasoning}"
                         </p>
                         <div className="flex gap-3 mt-6">
                           <div className="px-3 py-1.5 bg-primary/20 rounded-lg text-[10px] text-primary font-bold tracking-wider">INSIGHT_{report.job_id.split('_').pop()}</div>
                           <div className="px-3 py-1.5 bg-destructive/20 rounded-lg text-[10px] text-destructive font-bold tracking-wider">DEBT_DETECTED</div>
                         </div>
                       </div>
                    </div>

                    <div>
                       <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-[0.2em] mb-6">Repository Stats</h3>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center hover:bg-white/10 transition-colors">
                           <div className="text-3xl font-mono font-black text-white">{report.deterministic_report.repository_summary.file_count}</div>
                           <div className="text-xs text-white/20 uppercase font-mono mt-2 tracking-widest">Files</div>
                         </div>
                         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl text-center hover:bg-white/10 transition-colors">
                           <div className="text-3xl font-mono font-black text-white">{report.deterministic_report.analysis_metrics.total_functions}</div>
                           <div className="text-xs text-white/20 uppercase font-mono mt-2 tracking-widest">Functions</div>
                         </div>
                       </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                        <h4 className="text-[10px] font-mono text-white/40 uppercase mb-5 text-center tracking-[0.3em]">Hotspot Clusters</h4>
                        <div className="space-y-3">
                           {report.deterministic_report.cluster_summary.top_clusters.map((c, i) => (
                             <div key={i} className="flex justify-between items-center text-[11px] font-mono p-2 hover:bg-white/5 rounded transition-colors group">
                                <span className="text-white/60 truncate max-w-[200px] group-hover:text-white transition-colors">{c.anchor_file}</span>
                                <div className="flex gap-3 items-center">
                                   <span className="text-destructive font-bold">{c.total_pain}</span>
                                   <span className="text-white/20">({c.members} files)</span>
                                </div>
                             </div>
                           ))}
                        </div>
                    </div>
                  </section>
                </div>
  
                <div className="mt-16 p-8 bg-secondary/5 border border-secondary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                   <div className="p-5 bg-secondary/10 rounded-full text-secondary animate-pulse-slow">
                     <CheckCircle2 size={40} />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                     <h4 className="text-2xl font-bold text-white">Final Verdict: {report.llm_insights.overall_verdict}</h4>
                     <p className="text-sm text-white/60 mt-2 max-w-xl leading-relaxed">The codebase configuration is currently reflecting a {report.llm_insights.technical_debt_score}% tech debt score. Resolution of hotspots and outdated packages is prioritized for maintaining architectural integrity.</p>
                   </div>
                   <button 
                     onClick={handleExport}
                     disabled={isExporting}
                     className="bg-secondary text-black px-8 py-4 rounded-2xl font-bold whitespace-nowrap hover:bg-secondary/90 hover:scale-105 transition-all shadow-lg shadow-secondary/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed no-export"
                   >
                     {isExporting ? (
                       <>
                         <Loader2 className="animate-spin" size={20} />
                         Generating PDF...
                       </>
                     ) : (
                       <>
                         <Download size={20} />
                         Export Full PDF Report
                       </>
                     )}
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
