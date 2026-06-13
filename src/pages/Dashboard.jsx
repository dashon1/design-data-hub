import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Plug, 
  Database, 
  Download, 
  TrendingUp,
  Zap,
  Sparkles
} from "lucide-react";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentConnections from "../components/dashboard/RecentConnections";
import QuickActions from "../components/dashboard/QuickActions";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import APIHealthMonitor from "../components/dashboard/APIHealthMonitor";

export default function Dashboard() {
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.APIConnection.list("-created_date")
  });

  const { data: exports = [], isLoading: exportsLoading } = useQuery({
    queryKey: ['exports'],
    queryFn: () => base44.entities.DataExport.list("-created_date", 5)
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 10)
  });

  const isLoading = connectionsLoading || exportsLoading;
  const activeConnections = connections.filter(c => c.status === "active").length;
  const totalExports = exports.reduce((sum, e) => sum + (e.download_count || 0), 0);

  const loadData = async () => {
    // Handled by React Query refetch
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 text-white">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  <h1 className="text-3xl md:text-4xl font-bold">Welcome to DataHub</h1>
                </div>
                <p className="text-lg text-blue-100 max-w-2xl">
                  Connect to real APIs and transform live data into beautiful mockups. 
                  Bridge the gap between design and development with authentic data.
                </p>
              </div>
              <Link to={createPageUrl("APIs")}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Connect First API
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl translate-y-24 -translate-x-24" />
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          connections={connections.length}
          activeConnections={activeConnections}
          totalExports={totalExports}
          recentExports={exports.length}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentConnections 
              connections={connections}
              isLoading={isLoading}
              onRefresh={loadData}
            />

            <ActivityFeed 
              activities={activities}
              isLoading={activitiesLoading}
            />
          </div>

          <div className="space-y-6">
            <QuickActions />

            <APIHealthMonitor 
              connections={connections}
              isLoading={isLoading}
            />

            {/* Recent Exports */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Download className="w-5 h-5 text-green-600" />
                  Recent Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exports.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Database className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No exports yet</p>
                    <p className="text-xs mt-1">Start by connecting an API</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exports.slice(0, 3).map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{exportItem.name}</p>
                          <p className="text-xs text-slate-500">{exportItem.format.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">{exportItem.download_count || 0}</p>
                          <p className="text-xs text-slate-500">downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}