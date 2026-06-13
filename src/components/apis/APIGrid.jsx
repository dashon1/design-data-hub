import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Globe,
  Edit,
  TestTube,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const statusConfig = {
  active: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
    dot: "bg-green-500"
  },
  inactive: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: AlertCircle,
    dot: "bg-gray-400"
  },
  error: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    dot: "bg-red-500"
  }
};

const categoryColors = {
  users: "bg-blue-100 text-blue-800",
  products: "bg-purple-100 text-purple-800",
  content: "bg-green-100 text-green-800",
  analytics: "bg-orange-100 text-orange-800",
  social: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

export default function APIGrid({ connections, isLoading, onEdit, onDelete, onRefresh }) {
  const [testingId, setTestingId] = useState(null);

  const testConnection = async (connection) => {
    setTestingId(connection.id);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Test this API endpoint: ${connection.url}. Return a simple success or failure message.`,
      });
      
      await base44.entities.ActivityLog.create({
        action: "api_tested",
        entity_type: "APIConnection",
        entity_id: connection.id,
        details: { name: connection.name }
      });
      
      await onRefresh();
    } catch (error) {
      console.error("Test failed", error);
    }
    setTestingId(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Globe className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-3">No API connections yet</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Start by connecting to your first API to bring real data into your design workflow
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {connections.map((connection) => {
        const StatusIcon = statusConfig[connection.status]?.icon || AlertCircle;

        return (
          <Card
            key={connection.id}
            className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[connection.status]?.dot}`} />
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {connection.name}
                    </CardTitle>
                  </div>
                  <Badge className={categoryColors[connection.category] || categoryColors.other}>
                    {connection.category}
                  </Badge>
                </div>
                <Badge className={`${statusConfig[connection.status]?.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {connection.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {connection.description || 'No description provided'}
                </p>

                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <Globe className="w-3 h-3" />
                  <span className="truncate">{connection.url}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {connection.last_fetched ?
                      `Last fetched ${format(new Date(connection.last_fetched), "MMM d")}` :
                      "Never fetched"
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Badge variant="outline" className="text-xs">
                  {connection.method}
                </Badge>

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(connection)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => testConnection(connection)} disabled={testingId === connection.id}>
                    {testingId === connection.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          <strong> {connection.name}</strong> API connection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(connection.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}