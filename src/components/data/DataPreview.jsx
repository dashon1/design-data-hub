
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Copy, 
  Eye,
  AlertCircle,
  Database,
  FileJson,
  Grid,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DataPreview({ connection, data, isLoading }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardContent className="text-center py-12">
          <Database className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Yet</h3>
          <p className="text-slate-600">Click "Fetch Data" to load information from the selected API</p>
        </CardContent>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardContent className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
          <p className="text-slate-600">{data.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Data from {connection.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(data)}
                className={isCopied ? "border-green-500 text-green-600" : ""}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {isCopied ? "Copied!" : "Copy JSON"}
              </Button>
              <Link to={createPageUrl(`Exports?api_id=${connection.id}`)}>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{data.data?.length || 0}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileJson className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Data Format</span>
              </div>
              <p className="text-sm font-semibold text-green-900">
                {data.metadata?.format || 'JSON'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Grid className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Fields</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {data.data?.[0] ? Object.keys(data.data[0]).length : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {data.data && data.data.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-slate-600" />
              Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    {Object.keys(data.data[0]).map((key) => (
                      <th key={key} className="text-left p-3 font-semibold text-slate-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      {Object.entries(item).map(([key, value]) => (
                        <td key={key} className="p-3 text-sm text-slate-600">
                          {typeof value === 'object' ? (
                            <Badge variant="outline" className="text-xs">
                              Object
                            </Badge>
                          ) : typeof value === 'boolean' ? (
                            <Badge variant={value ? "default" : "secondary"} className="text-xs">
                              {value.toString()}
                            </Badge>
                          ) : (
                            <span className="max-w-xs truncate block">
                              {String(value)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.data.length > 5 && (
                <div className="text-center py-4 text-slate-500">
                  <p className="text-sm">
                    Showing 5 of {data.data.length} records
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-orange-600" />
            Raw JSON Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
