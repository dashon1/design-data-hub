
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, X } from "lucide-react";

const EXPORT_FORMATS = [
  { value: "json", label: "JSON", description: "Standard JSON format" },
  { value: "csv", label: "CSV", description: "Comma-separated values" },
  { value: "figma-json", label: "Figma JSON", description: "Optimized for Figma plugins" },
  { value: "sketch-json", label: "Sketch JSON", description: "Optimized for Sketch plugins" }
];

export default function ExportForm({ connections, preselectedApiId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    api_connection_id: preselectedApiId || "",
    format: "json",
    filters: {}
  });

  useEffect(() => {
    if (preselectedApiId) {
      setFormData(prev => ({ ...prev, api_connection_id: preselectedApiId }));
    }
  }, [preselectedApiId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate sample data for the export
    const sampleData = {
      users: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" }
      ]
    };
    
    onSave({
      ...formData,
      data_sample: sampleData
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-green-600" />
          Create New Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Export Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., User Profiles for Homepage"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection">API Connection</Label>
            <Select
              value={formData.api_connection_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, api_connection_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an API connection" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div>
                      <div className="font-medium">{connection.name}</div>
                      <div className="text-xs text-slate-500">{connection.category}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-slate-500">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Create Export
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
