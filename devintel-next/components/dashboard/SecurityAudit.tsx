import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurityVulnerability } from "@/types/repository";

interface SecurityAuditProps {
  vulnerabilities: SecurityVulnerability[];
  security_critical_count: number | null;
  security_high_count: number | null;
  security_medium_count: number | null;
  security_low_count: number | null;
}

export function SecurityAudit({
  vulnerabilities,
  security_critical_count,
  security_high_count,
  security_medium_count,
  security_low_count,
}: SecurityAuditProps) {
  return (
    <Card className="bg-surface border-white/5 border-none shadow-none ring-0">
      <CardHeader className="p-0 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              Security Vulnerability Audit
            </CardTitle>
            <CardDescription className="text-xs mt-1 text-white/30">
              {vulnerabilities.length} vulnerabilities found.
            </CardDescription>
          </div>
          <div className="px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-[12px] font-bold">
            {(security_critical_count ?? 0) > 0 ? "CRITICAL" : "SECURE"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-destructive font-bold text-2xl font-mono">
                  {security_critical_count ?? 0}
                </div>
                <div className="text-[12px] text-white/40 uppercase font-mono mt-1">
                  Critical
                </div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-orange-400 font-bold text-2xl font-mono">
                  {security_high_count ?? 0}
                </div>
                <div className="text-[12px] text-white/40 uppercase font-mono mt-1">
                  High
                </div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-warning font-bold text-2xl font-mono">
                  {security_medium_count ?? 0}
                </div>
                <div className="text-[12px] text-white/40 uppercase font-mono mt-1">
                  Medium
                </div>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="text-primary font-bold text-2xl font-mono">
                  {security_low_count ?? 0}
                </div>
                <div className="text-[12px] text-white/40 uppercase font-mono mt-1">
                  Low
                </div>
              </div>
            </div>

            <Accordion className="w-full">
              {vulnerabilities.map((vuln, i) => (
                <AccordionItem
                  key={i}
                  value={`vuln-${i}`}
                  className="border-white/5"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <AlertTriangle
                        size={18}
                        className={cn(
                          vuln.severity === "high" ||
                            vuln.severity === "critical"
                            ? "text-destructive"
                            : "text-warning",
                        )}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white/90">
                          {vuln.title}
                        </h4>
                        <p className="text-[12px] text-white/40 font-mono">
                          Found in {vuln.location ?? vuln.file_path}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-black/20 p-4 rounded-lg text-xs leading-relaxed text-white/60">
                    <p className="mb-3">{vuln.description}</p>
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md font-mono text-[12px] text-destructive-foreground">
                      Recommendation: {vuln.remediation}
                    </div>
                    {vuln.cve && (
                      <div className="mt-2 text-[12px] font-mono text-white/30">
                        CVE: {vuln.cve}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
