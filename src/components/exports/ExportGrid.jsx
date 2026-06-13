
import React from 'react';
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
  Download, 
  FileText, 
  Database,
  Calendar,
  TrendingUp,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

const formatIcons = {
  json: FileText,
  csv: Database,
  "figma-json": FileText,
  "sketch-json": FileText
};

const formatColors = {
  json: "bg-blue-100 text-blue-800",
  csv: "bg-green-100 text-green-800",
  "figma-json": "bg-purple-100 text-purple-800",
  "sketch-json": "bg-orange-100 text-orange-800"
};

export default function ExportGrid({ exports, connections, isLoading, onDelete, onRefresh }) {
  const downloadExport = (exportItem) => {
    const data = exportItem.data_sample || { message: "Sample export data" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportItem.name}.${exportItem.format === 'csv' ? 'csv' : 'json'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Download className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-3">No exports created yet</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Create your first export to download API data in designer-friendly formats
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exports.map((exportItem) => {
        const connection = connections.find(c => c.id === exportItem.api_connection_id);
        const FormatIcon = formatIcons[exportItem.format] || FileText;
        
        return (
          <Card 
            key={exportItem.id}
            className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {exportItem.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    From: {connection?.name || 'Unknown API'}
                  </p>
                </div>
                <Badge className={formatColors[exportItem.format] || formatColors.json}>
                  <FormatIcon className="w-3 h-3 mr-1" />
                  {exportItem.format.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{exportItem.download_count || 0} downloads</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(exportItem.created_date), "MMM d")}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={() => downloadExport(exportItem)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the <strong>{exportItem.name}</strong> export.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(exportItem.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
