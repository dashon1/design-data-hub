import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, Zap, AlertTriangle } from "lucide-react";

export default function APIHealthMonitor({ connections = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600 animate-pulse" />
            API Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const activeAPIs = connections.filter(c => c.status === 'active');
  const avgHealthScore = activeAPIs.length > 0
    ? activeAPIs.reduce((sum, c) => sum + (c.health_score || 100), 0) / activeAPIs.length
    : 100;
  
  const avgResponseTime = activeAPIs.length > 0
    ? activeAPIs.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / activeAPIs.length
    : 0;

  const healthyAPIs = activeAPIs.filter(c => (c.health_score || 100) >= 80).length;
  const warningAPIs = activeAPIs.filter(c => (c.health_score || 100) < 80 && (c.health_score || 100) >= 50).length;
  const criticalAPIs = activeAPIs.filter(c => (c.health_score || 100) < 50).length;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Activity className="w-5 h-5 text-green-600" />
          API Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAPIs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No active APIs to monitor</p>
          </div>
        ) : (
          <>
            {/* Overall Health Score */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Overall Health</span>
                <span className="text-2xl font-bold text-green-700">{Math.round(avgHealthScore)}%</span>
              </div>
              <Progress value={avgHealthScore} className="h-2" />
            </div>

            {/* Response Time */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Avg Response Time</span>
              </div>
              <span className="text-sm font-bold text-blue-700">
                {avgResponseTime > 0 ? `${Math.round(avgResponseTime)}ms` : 'N/A'}
              </span>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Status Breakdown</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{healthyAPIs}</div>
                  <div className="text-xs text-green-600">Healthy</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{warningAPIs}</div>
                  <div className="text-xs text-yellow-600">Warning</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{criticalAPIs}</div>
                  <div className="text-xs text-red-600">Critical</div>
                </div>
              </div>
            </div>

            {/* Top Performing */}
            {activeAPIs.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-slate-700">Top Performing</h4>
                </div>
                <div className="space-y-2">
                  {activeAPIs
                    .sort((a, b) => (b.health_score || 100) - (a.health_score || 100))
                    .slice(0, 3)
                    .map((api) => (
                      <div key={api.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 truncate flex-1">{api.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {api.health_score || 100}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}