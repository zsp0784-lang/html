import { ExternalLink, Plane } from 'lucide-react';

export function VisitJapanCard() {
  return (
    <a 
      href="https://www.vjw.digital.go.jp/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="group block rounded-lg border border-border/50 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent/50"
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src="/images/ui/vjw-banner.png" 
          alt="Visit Japan Web" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
          <Plane className="h-5 w-5" />
          <span className="font-serif font-bold text-lg">Visit Japan Web</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-serif text-lg font-bold text-primary">日本入境審查及海關申報</h4>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          出發前請務必完成線上入境資料填寫，加速通關流程。包含入境審查、海關申報及免稅購買功能。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded uppercase tracking-wider">
            官方服務
          </span>
          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
            快速通關
          </span>
        </div>
      </div>
    </a>
  );
}
