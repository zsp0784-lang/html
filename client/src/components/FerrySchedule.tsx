import React, { useState, useEffect } from 'react';
import { Ship, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";

interface ScheduleItem {
  out: string;
  arr?: string;
  stop?: string;
}

interface FerryRoute {
  name: string;
  operator: string;
  url: string;
  outbound_label: string;
  inbound_label?: string;
  outbound: ScheduleItem[];
  inbound?: ScheduleItem[];
}

interface FerryData {
  [key: string]: FerryRoute;
  syncStatus?: string;
  lastUpdated?: string;
}

export const FerrySchedule: React.FC = () => {
  const [data, setData] = useState<FerryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ferry/schedules');
      if (response.ok) {
        const ferryData = await response.json();
        setData(ferryData);
      }
    } catch (error) {
      console.error('Error fetching ferry schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      setLastSuccess(false);
      const password = '6p1ry4u7oGfw0M8zQ5vP3daXjeIV2tS9';
      
      const response = await fetch('/api/ferry/scrape', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scrape failed');
      }
      
      const result = await response.json();
      console.log('Scrape result:', result);
      
      // 同步成功後，重新獲取最新數據
      await fetchSchedules();
      setLastSuccess(true);
      toast.success("更新成功");
    } catch (error) {
      console.error('Error scraping ferry schedules:', error);
      toast.error("更新失敗");
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getSyncStatusIcon = (status?: string) => {
    switch(status) {
      case 'success':
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case 'partial':
        return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
      case 'failed':
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      default:
        return null;
    }
  };

  const getSyncStatusText = (status?: string) => {
    switch(status) {
      case 'success':
        return <span className="text-xs text-green-600 font-medium">✓ 同步成功</span>;
      case 'partial':
        return <span className="text-xs text-yellow-600 font-medium">⚠ 部分同步</span>;
      case 'failed':
        return <span className="text-xs text-red-600 font-medium">✗ 同步失敗</span>;
      default:
        return null;
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center">載入中...</div>;
  }

  // 定義顯示順序：shodoshima, ogi, uno
  const routeOrder = ['shodoshima', 'ogi', 'uno'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-3xl font-bold text-primary">船班時刻表</h2>
          {data?.syncStatus && (
            <div className="flex items-center gap-1.5">
              {getSyncStatusIcon(data.syncStatus)}
              {getSyncStatusText(data.syncStatus)}
            </div>
          )}
        </div>
        <button 
          onClick={handleScrape}
          disabled={scraping}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
            scraping 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${scraping ? 'animate-spin' : ''}`} />
          {scraping ? '更新中...' : '更新船班'}
        </button>
      </div>

      {!data || Object.keys(data).length === 0 ? (
        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">請點擊上方按鈕更新船班資料</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {routeOrder.map((routeKey) => {
            const route = data[routeKey] as FerryRoute | undefined;
            if (!route) return null;
            
            return (
              <div key={routeKey} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="bg-gradient-to-r from-accent/20 to-transparent p-5 flex justify-between items-center border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent p-2.5 rounded-xl shadow-sm">
                      <Ship className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-primary">{route.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{route.operator}</p>
                    </div>
                  </div>
                  <a 
                    href={route.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-bold text-accent hover:bg-accent/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    官網 <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="p-6 space-y-8">
                  {/* 去程 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-primary/80">
                      <span className="font-bold text-sm">{route.outbound_label}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {route.outbound.map((item, idx) => (
                        <div key={idx} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center group hover:border-blue-300 transition-colors">
                          <span className="font-mono font-black text-xl text-blue-700">{item.out}</span>
                          {item.stop && (
                            <div className="mt-1 text-[9px] text-blue-600/70 font-bold text-center">{item.stop}</div>
                          )}
                          <div className="mt-1 text-[10px] text-blue-600/70 font-bold">抵達 {item.arr}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 回程 - 所有路線都顯示 */}
                  {route.inbound && route.inbound.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-primary/80">
                        <span className="font-bold text-sm">{route.inbound_label}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {route.inbound.map((item, idx) => (
                          <div key={idx} className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col items-center group hover:border-orange-300 transition-colors">
                            <span className="font-mono font-black text-xl text-orange-700">{item.out}</span>
                            {item.stop && (
                              <div className="mt-1 text-[9px] text-orange-600/70 font-bold text-center">{item.stop}</div>
                            )}
                            <div className="mt-1 text-[10px] text-orange-600/70 font-bold">抵達 {item.arr}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-lg mt-1">
            <span className="text-xl">💡</span>
          </div>
          <div className="text-sm text-primary/80 leading-relaxed">
            <p className="font-bold text-base mb-2">乘船小貼士：</p>
            <ul className="list-disc list-inside space-y-2">
              <li>此列表顯示三家船公司的最新船班時刻。</li>
              <li>船班可能因天氣或維修狀況調整，建議出發前再次確認。</li>
              <li>建議在開船前 <span className="font-bold text-accent">20 分鐘</span> 抵達港口。</li>
              <li>男木島路線會停靠女木島，請注意中途停靠時間。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
