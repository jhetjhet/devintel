import { Analysis } from '@/components/Analysis';

type AnalysisPageProps = {
  params: {
    id: string;
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = await params;

  return <Analysis repositoryId={id} />;
}
