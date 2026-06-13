import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  RefreshCw, 
  Eye, 
  Download,
  Loader2,
  AlertCircle,
  MousePointerClick // Changed from MousePointerSquare to MousePointerClick
} from "lucide-react";

import DataPreview from "../components/data/DataPreview";
import SnapshotCreator from "../components/data/SnapshotCreator";

const DataBrowserGuide = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
    <CardContent className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MousePointerClick className="w-12 h-12 text-blue-500" /> {/* Changed icon here */}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">Explore Your Data</h3>
      <p className="text-slate-600 max-w-md mx-auto">
        Select an active API connection from the dropdown above, then click "Fetch Data" to preview the response and export it for your designs.
      </p>
    </CardContent>
  </Card>
);

export default function Data() {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [showSnapshotCreator, setShowSnapshotCreator] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    const data = await base44.entities.APIConnection.list("-created_date");
    setConnections(data.filter(c => c.status === "active"));
    setIsLoading(false);
  };

  const fetchAPIData = async (connection) => {
    setIsFetching(true);
    setApiData(null);
    
    try {
      // Simulate API data fetching using LLM
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate realistic sample data for this API: ${connection.name} (${connection.description}). 
                 URL: ${connection.url}. 
                 Return an array of 5-10 realistic data objects that would come from this API.`,
        response_json_schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { type: "object" }
            },
            total_count: { type: "number" },
            metadata: {
              type: "object",
              properties: {
                schema: { type: "object" },
                format: { type: "string" }
              }
            }
          }
        }
      });
      
      setApiData(response);
      
      // Update last fetched time and log activity
      await base44.entities.APIConnection.update(connection.id, {
        ...connection,
        last_fetched: new Date().toISOString()
      });

      await base44.entities.ActivityLog.create({
        action: "data_fetched",
        entity_type: "APIConnection",
        entity_id: connection.id,
        details: { name: connection.name }
      });
      
    } catch (error) {
      console.error("Error fetching API data:", error);
      setApiData({ error: "Failed to fetch data from API" });
    }
    
    setIsFetching(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Browser</h1>
            <p className="text-slate-600">Explore and preview data from your connected APIs</p>
          </div>
        </div>

        {/* Connection Selector */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Select API Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading connections...
              </div>
            ) : connections.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No active API connections found</p>
                <p className="text-sm mt-1">Connect and test an API first</p>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <Select 
                  value={selectedConnection?.id || ""} 
                  onValueChange={(id) => {
                    const connection = connections.find(c => c.id === id);
                    setSelectedConnection(connection);
                    setApiData(null);
                  }}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Choose an API to explore..." />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        <div className="flex items-center gap-2">
                          <span>{connection.name}</span>
                          <span className="text-xs text-slate-500">({connection.category})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedConnection && (
                  <Button 
                    onClick={() => fetchAPIData(selectedConnection)}
                    disabled={isFetching}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Fetch Data
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Preview or Guide */}
        {selectedConnection ? (
          <>
            {apiData && !isFetching && (
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setShowSnapshotCreator(!showSnapshotCreator)}
                  variant="outline"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {showSnapshotCreator ? "Hide" : "Create"} Snapshot
                </Button>
              </div>
            )}
            
            {showSnapshotCreator && apiData && (
              <SnapshotCreator
                connection={selectedConnection}
                data={apiData}
                onSuccess={() => setShowSnapshotCreator(false)}
              />
            )}
            
            <DataPreview 
              connection={selectedConnection}
              data={apiData}
              isLoading={isFetching}
            />
          </>
        ) : !isLoading && (
          <DataBrowserGuide />
        )}
      </div>
    </div>
  );
}