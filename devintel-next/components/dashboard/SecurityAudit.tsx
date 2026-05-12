import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Package, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FullAuditReport } from '@/types/schemas';

interface SecurityAuditProps {
  report: FullAuditReport;
}

export function SecurityAudit({ report }: SecurityAuditProps) {
  return (
    <Card className="bg-surface border-white/5 border-none shadow-none ring-0">
      <CardHeader className="p-0 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              Security Vulnerability Audit
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-white/30">AI agents scanned {report.deterministic_report.repository_summary.file_count} dependency files and logic blocks.</CardDescription>
          </div>
          <div className="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-[10px] font-bold">
            {report.deterministic_report.security_audit.critical_count > 0 ? 'CRITICAL' : 'SECURE'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-destructive font-bold text-2xl font-mono">{report.deterministic_report.security_audit.critical_count}</div>
                <div className="text-[10px] text-white/40 uppercase font-mono mt-1">Critical Issues</div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-warning font-bold text-2xl font-mono">{report.deterministic_report.security_audit.medium_count}</div>
                <div className="text-[10px] text-white/40 uppercase font-mono mt-1">Medium Risks</div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-primary font-bold text-2xl font-mono">{report.deterministic_report.dependency_summary.outdated_packages.length}</div>
                <div className="text-[10px] text-white/40 uppercase font-mono mt-1">Outdated Pkgs</div>
              </div>
            </div>

            {/* @ts-ignore */}
            <Accordion type="single" collapsible className="w-full">
              {report.deterministic_report.security_audit.vulnerabilities.map((vuln, i) => (
                <AccordionItem key={i} value={`vuln-${i}`} className="border-white/5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <AlertTriangle size={18} className={cn(
                        vuln.severity === 'high' || vuln.severity === 'critical' ? "text-destructive" : "text-warning"
                      )} />
                      <div>
                        <h4 className="text-sm font-bold text-white/90">{vuln.title}</h4>
                        <p className="text-[10px] text-white/40 font-mono">Found in {vuln.location}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-black/20 p-4 rounded-lg text-xs leading-relaxed text-white/60">
                    <p className="mb-3">{vuln.description}</p>
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md font-mono text-[10px] text-destructive-foreground">
                      Recommendation: {vuln.remediation}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              
              <AccordionItem value="outdated" className="border-white/5">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <Package size={18} className="text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white/90">Outdated Dependencies</h4>
                      <p className="text-[10px] text-white/40 font-mono">{report.deterministic_report.dependency_summary.outdated_packages.length} packages requiring updates</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-black/20 p-4 rounded-lg">
                  <div className="space-y-2">
                     {report.deterministic_report.dependency_summary.outdated_packages.slice(0, 10).map((pkg, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2 last:border-0 pt-2 first:pt-0">
                          <span className="text-white/60">{pkg.name}</span>
                          <div className="flex gap-4">
                             <span className="text-white/20">{pkg.current}</span>
                             <ChevronRight size={10} className="text-white/20" />
                             <span className="text-secondary">{pkg.recommended}</span>
                          </div>
                       </div>
                     ))}
                     {report.deterministic_report.dependency_summary.outdated_packages.length > 10 && (
                       <div className="text-[8px] text-center text-white/20 mt-2">+{report.deterministic_report.dependency_summary.outdated_packages.length - 10} more...</div>
                     )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
