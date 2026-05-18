import HomeContent from "@/components/HomeContent";
import { AuthUser } from "@/types/auth";

type HomePageProps = {
  user: AuthUser | null;
};

export default async function HomePage({ user }: HomePageProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>
      <HomeContent user={user} />
    </div>
  );
}
