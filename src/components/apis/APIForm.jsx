import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { 
  Save, 
  X, 
  TestTube, 
  Globe,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const CATEGORIES = [
  "users", "products", "content", "analytics", "social", "other"
];

export default function APIForm({ connection, onSave, onCancel }) {
  const [formData, setFormData] = useState(connection || {
    name: "",
    url: "",
    method: "GET",
    headers: {},
    description: "",
    category: "other",
    status: "inactive"
  });
  
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [headerInput, setHeaderInput] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addHeader = () => {
    if (!headerInput.trim()) return;
    const [key, ...valueParts] = headerInput.split(':');
    const value = valueParts.join(':').trim();
    
    if (key && value) {
      setFormData(prev => ({
        ...prev,
        headers: { ...prev.headers, [key.trim()]: value }
      }));
      setHeaderInput("");
    }
  };

  const removeHeader = (keyToRemove) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([key]) => key !== keyToRemove)
      )
    }));
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Test this API endpoint: ${formData.url} with method ${formData.method} and headers ${JSON.stringify(formData.headers)}. Return the status and a brief description of the response format.`,
        response_json_schema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["success", "error"] },
            message: { type: "string" },
            data_format: { type: "string" }
          }
        }
      });
      
      setTestResult(response);
      if (response.status === "success") {
        setFormData(prev => ({ ...prev, status: "active" }));
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: "Failed to test connection",
        data_format: "Unknown"
      });
    }
    
    setIsTesting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          {connection ? 'Edit API Connection' : 'New API Connection'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., User Profiles API"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">API Endpoint URL</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://api.example.com/users"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleInputChange('method', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Headers (Authentication & Custom)</Label>
            <div className="flex gap-2">
              <Input
                value={headerInput}
                onChange={(e) => setHeaderInput(e.target.value)}
                placeholder="Authorization: Bearer token"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHeader())}
              />
              <Button type="button" variant="outline" onClick={addHeader}>
                <Key className="w-4 h-4" />
              </Button>
            </div>
            
            {Object.entries(formData.headers || {}).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(formData.headers).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    <span className="font-medium">{key}:</span>
                    <span className="max-w-20 truncate">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeHeader(key)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what data this API provides..."
              rows={3}
            />
          </div>

          {/* Test Connection */}
          <div className="border rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Connection
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isTesting || !formData.url}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test API
                  </>
                )}
              </Button>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult.status === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="font-medium">{testResult.message}</span>
                </div>
                {testResult.data_format && (
                  <p className="text-sm">Data format: {testResult.data_format}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="w-4 h-4 mr-2" />
              {connection ? 'Update' : 'Save'} Connection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}