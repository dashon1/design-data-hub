import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Search, 
  TrendingUp,
  Zap,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  users: "bg-blue-100 text-blue-800",
  products: "bg-purple-100 text-purple-800",
  content: "bg-green-100 text-green-800",
  analytics: "bg-orange-100 text-orange-800",
  social: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.APITemplate.list("-usage_count")
  });

  const createFromTemplate = useMutation({
    mutationFn: async (template) => {
      // Create API connection from template
      const newConnection = await base44.entities.APIConnection.create({
        name: template.name,
        url: template.url,
        method: template.method,
        headers: template.headers,
        description: template.description,
        category: template.category,
        status: "inactive"
      });

      // Update template usage count
      await base44.entities.APITemplate.update(template.id, {
        ...template,
        usage_count: (template.usage_count || 0) + 1
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        action: "api_created",
        entity_type: "APIConnection",
        entity_id: newConnection.id,
        details: { name: template.name, source: "template" }
      });

      return newConnection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      navigate(createPageUrl("APIs"));
    }
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <h1 className="text-3xl md:text-4xl font-bold">API Templates</h1>
            </div>
            <p className="text-lg text-purple-100 max-w-2xl">
              Get started quickly with pre-configured API connections. One-click setup for popular services.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60"
          />
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No templates found</h3>
              <p className="text-slate-600">Try a different search term</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card 
                key={template.id}
                className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors mb-2">
                        {template.icon && <span className="mr-2">{template.icon}</span>}
                        {template.name}
                      </CardTitle>
                      <Badge className={categoryColors[template.category] || categoryColors.other}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {template.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{template.url}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <TrendingUp className="w-3 h-3" />
                      <span>{template.usage_count || 0} uses</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createFromTemplate.mutate(template)}
                      disabled={createFromTemplate.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}