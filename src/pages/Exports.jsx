import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";

import ExportForm from "../components/exports/ExportForm";
import ExportGrid from "../components/exports/ExportGrid";

export default function Exports() {
  const [exports, setExports] = useState([]);
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedApiId = queryParams.get('api_id');

  useEffect(() => {
    loadData();
    if (preselectedApiId) {
      setShowForm(true);
    }
  }, [preselectedApiId]);

  const loadData = async () => {
    setIsLoading(true);
    const [exportsData, connectionsData] = await Promise.all([
      base44.entities.DataExport.list("-created_date"),
      base44.entities.APIConnection.list("-created_date")
    ]);
    setExports(exportsData);
    setConnections(connectionsData.filter(c => c.status === "active"));
    setIsLoading(false);
  };

  const handleSave = async (exportData) => {
    const newExport = await base44.entities.DataExport.create(exportData);
    await base44.entities.ActivityLog.create({
      action: "export_created",
      entity_type: "DataExport",
      entity_id: newExport.id,
      details: { name: exportData.name }
    });
    setShowForm(false);
    loadData();
  };
  
  const handleDelete = async (exportId) => {
    await base44.entities.DataExport.delete(exportId);
    loadData();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Export Center</h1>
            <p className="text-slate-600">Download API data in designer-friendly formats</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
            disabled={connections.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Export
          </Button>
        </div>

        {/* Export Form */}
        {showForm && (
          <ExportForm
            connections={connections}
            preselectedApiId={preselectedApiId}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Export Grid */}
        <ExportGrid
          exports={exports}
          connections={connections}
          isLoading={isLoading}
          onDelete={handleDelete}
          onRefresh={loadData}
        />
      </div>
    </div>
  );
}