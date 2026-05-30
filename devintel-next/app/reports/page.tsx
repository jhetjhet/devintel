import ReportsPageContents from "@/components/ReportsPageContents";
import { fetchRepoAnalysis } from "@/lib/api.server";
import Link from "next/link";

export default async function ReportsPage() {
  const repoAnalysis = await fetchRepoAnalysis();

  return (
    <div className="min-h-screen bg-surface p-6 pt-20 md:p-12 md:pt-20">
      <Link href="/">
        <p className="text-sm text-primary hover:underline mb-4 inline-block">
          &larr; Back to Home
        </p>
      </Link>
      <h1 className="text-2xl font-bold text-white mb-4">Reports</h1>
      <ReportsPageContents repoAnalysis={repoAnalysis} />
    </div>
  );
}
