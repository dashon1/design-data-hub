
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plug, 
  Globe, 
  RefreshCw, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusConfig = {
  active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle },
  error: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
};

const categoryColors = {
  users: "bg-blue-100 text-blue-800",
  products: "bg-purple-100 text-purple-800", 
  content: "bg-green-100 text-green-800",
  analytics: "bg-orange-100 text-orange-800",
  social: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

export default function RecentConnections({ connections, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Plug className="w-5 h-5 text-blue-600" />
            API Connections
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No API connections yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Connect to your favorite APIs to start using real data in your designs
            </p>
            <Link to={createPageUrl("APIs")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First API
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.slice(0, 5).map((connection) => {
              const StatusIcon = statusConfig[connection.status]?.icon || AlertCircle;
              
              return (
                <div key={connection.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {connection.name}
                        </h3>
                        <Badge className={categoryColors[connection.category] || categoryColors.other}>
                          {connection.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{connection.description}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-xs">{connection.url}</span>
                      </div>
                    </div>
                    <Badge className={`${statusConfig[connection.status]?.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {connection.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {connection.last_fetched ? 
                          `Fetched ${format(new Date(connection.last_fetched), "MMM d")}` : 
                          "Never fetched"
                        }
                      </span>
                      <span>{connection.method}</span>
                    </div>
                    <a href={connection.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
            
            {connections.length > 5 && (
              <div className="text-center pt-4">
                <Link to={createPageUrl("APIs")}>
                  <Button variant="outline" className="w-full">
                    View All APIs ({connections.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
