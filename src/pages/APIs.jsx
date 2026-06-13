import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import APIForm from "../components/apis/APIForm";
import APIGrid from "../components/apis/APIGrid";

export default function APIs() {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    const data = await base44.entities.APIConnection.list("-created_date");
    setConnections(data);
    setIsLoading(false);
  };

  const handleSave = async (connectionData) => {
    if (editingConnection) {
      await base44.entities.APIConnection.update(editingConnection.id, connectionData);
      await base44.entities.ActivityLog.create({
        action: "api_updated",
        entity_type: "APIConnection",
        entity_id: editingConnection.id,
        details: { name: connectionData.name }
      });
    } else {
      const newConnection = await base44.entities.APIConnection.create(connectionData);
      await base44.entities.ActivityLog.create({
        action: "api_created",
        entity_type: "APIConnection",
        entity_id: newConnection.id,
        details: { name: connectionData.name }
      });
    }
    setShowForm(false);
    setEditingConnection(null);
    loadConnections();
  };

  const handleEdit = (connection) => {
    setEditingConnection(connection);
    setShowForm(true);
  };

  const handleDelete = async (connectionId) => {
    const connection = connections.find(c => c.id === connectionId);
    await base44.entities.APIConnection.delete(connectionId);
    if (connection) {
      await base44.entities.ActivityLog.create({
        action: "api_deleted",
        entity_type: "APIConnection",
        entity_id: connectionId,
        details: { name: connection.name }
      });
    }
    loadConnections();
  };

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">API Connections</h1>
            <p className="text-slate-600">Connect to external APIs and fetch real data for your designs</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add API Connection
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60"
          />
        </div>

        {/* API Form */}
        {showForm && (
          <APIForm
            connection={editingConnection}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingConnection(null);
            }}
          />
        )}

        {/* API Grid */}
        <APIGrid
          connections={filteredConnections}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadConnections}
        />
      </div>
    </div>
  );
}