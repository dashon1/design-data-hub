import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug, Zap, Download, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${gradient}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function StatsGrid({ 
  connections, 
  activeConnections, 
  totalExports, 
  recentExports, 
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total APIs"
        value={connections}
        icon={Plug}
        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        trend={connections > 0 ? "Ready to use" : "Get started"}
      />
      <StatCard
        title="Active APIs"
        value={activeConnections}
        icon={Zap}
        gradient="bg-gradient-to-br from-green-500 to-green-600"
        trend={`${Math.round((activeConnections / Math.max(connections, 1)) * 100)}% connected`}
      />
      <StatCard
        title="Total Downloads"
        value={totalExports}
        icon={Download}
        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
      />
      <StatCard
        title="Recent Exports"
        value={recentExports}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
      />
    </div>
  );
}