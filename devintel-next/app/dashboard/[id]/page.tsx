import { Dashboard } from "@/components/Dashboard";

type DashboardPageProps = {
  params: {
    id: string;
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { id } = await params;

  return (
    // <Dashboard 
    //   report={report}
    //   timelineHistory={timelineHistory}
    //   trendData={trendData}
    //   radarData={radarData}
    //   notifications={notifications}
    //   isResyncing={isResyncing}
    //   onResync={onResync}
    //   refactorDiff={refactorDiff}
    // />
    <Dashboard repository_id={id} />
  );
}
