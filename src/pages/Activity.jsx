import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity as ActivityIcon, 
  Clock,
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const actionIcons = {
  api_created: "🔗",
  api_updated: "✏️",
  api_deleted: "🗑️",
  api_tested: "🧪",
  data_fetched: "📥",
  export_created: "📦",
  export_downloaded: "⬇️",
  snapshot_created: "📸"
};

const actionColors = {
  api_created: "bg-green-100 text-green-800",
  api_updated: "bg-blue-100 text-blue-800",
  api_deleted: "bg-red-100 text-red-800",
  api_tested: "bg-purple-100 text-purple-800",
  data_fetched: "bg-indigo-100 text-indigo-800",
  export_created: "bg-orange-100 text-orange-800",
  export_downloaded: "bg-cyan-100 text-cyan-800",
  snapshot_created: "bg-pink-100 text-pink-800"
};

export default function Activity() {
  const [filterAction, setFilterAction] = useState("all");

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['activities', filterAction],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.list("-created_date", 50);
      return filterAction === "all" 
        ? logs 
        : logs.filter(log => log.action === filterAction);
    }
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity Log</h1>
            <p className="text-slate-600">Track all actions and changes in your workspace</p>
          </div>
          <div className="flex gap-3">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="api_created">API Created</SelectItem>
                <SelectItem value="api_tested">API Tested</SelectItem>
                <SelectItem value="data_fetched">Data Fetched</SelectItem>
                <SelectItem value="export_created">Export Created</SelectItem>
                <SelectItem value="export_downloaded">Downloaded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                <p>Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3" />
                <p>No activity to display</p>
                <p className="text-sm mt-2">Start using the app to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="text-3xl">{actionIcons[activity.action] || "📌"}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={actionColors[activity.action] || "bg-gray-100 text-gray-800"}>
                          {activity.action.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(activity.created_date), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{activity.entity_type}</span>
                        {activity.details?.name && (
                          <span> - <span className="font-semibold">{activity.details.name}</span></span>
                        )}
                      </p>
                      {activity.user_email && (
                        <p className="text-xs text-slate-500 mt-1">By {activity.user_email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}