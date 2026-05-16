import { startAudit } from "@/app/actions/evaluate";
import { AnalysisCompleteResponse } from "@/types/api";
import { useState, useTransition } from "react";

export default function useAudit() {
  const [error, setError] = useState<string | null>(null);
  const [auditIsPending, startAuditTransition] = useTransition();
  const [analysisRes, setAnalysisRes] = useState<Omit<AnalysisCompleteResponse, "analysis_run_id"> | null>(null);

  const initiateAudit = (repositoryId: string, force: boolean = false) => {
    setError(null);

    startAuditTransition(async () => {
      const respose = await startAudit(repositoryId, force);

      if (!respose.success) {
        if (respose.status === 429) {
          setError("Due to resource constraints, we are currently limiting the number of concurrent analyses. Please try again in a few minutes.");
          return;
        }

        setError(respose.error.message);
        return;
      }

      setAnalysisRes(respose.data);
    });
  };

  return { error, auditIsPending, analysisRes, initiateAudit };
}
