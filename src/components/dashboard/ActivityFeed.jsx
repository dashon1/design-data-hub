import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const actionEmojis = {
  api_created: "🔗",
  api_updated: "✏️",
  api_tested: "🧪",
  data_fetched: "📥",
  export_created: "📦",
  export_downloaded: "⬇️",
  snapshot_created: "📸"
};

const actionColors = {
  api_created: "bg-green-100 text-green-800",
  api_updated: "bg-blue-100 text-blue-800",
  api_tested: "bg-purple-100 text-purple-800",
  data_fetched: "bg-indigo-100 text-indigo-800",
  export_created: "bg-orange-100 text-orange-800",
  export_downloaded: "bg-cyan-100 text-cyan-800",
  snapshot_created: "bg-pink-100 text-pink-800"
};

export default function ActivityFeed({ activities = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
          <Link to={createPageUrl("Activity")}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-2xl">{actionEmojis[activity.action] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${actionColors[activity.action]} text-xs`}>
                      {activity.action.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 truncate">
                    {activity.details?.name || activity.entity_type}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(activity.created_date), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}