import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  points: string;
  type: 'growth' | 'system';
}

interface NotificationsFeedProps {
  notifications: Notification[];
}

export function NotificationsFeed({ notifications }: NotificationsFeedProps) {
  return (
    <Card className="bg-surface border-white/5 col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-white/60 text-sm font-mono uppercase tracking-widest">Knowledge Stream</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  notif.type === 'growth' ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                )}>
                  {notif.type === 'growth' ? <Zap size={14} /> : <Bot size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white/90 truncate">{notif.title}</h4>
                    <span className="text-[12px] font-mono text-secondary font-bold shrink-0">{notif.points}</span>
                  </div>
                  <p className="text-[12px] text-white/40 mt-0.5 line-clamp-1">{notif.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
