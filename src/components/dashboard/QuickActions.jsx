import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Database, 
  Download, 
  BookOpen,
  Zap
} from "lucide-react";

const ActionButton = ({ to, icon: Icon, title, description, gradient }) => (
  <Link to={to} className="block">
    <div className={`p-4 rounded-xl ${gradient} text-white hover:scale-105 transition-all duration-200 cursor-pointer group`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs opacity-90">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

export default function QuickActions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActionButton
          to={createPageUrl("APIs")}
          icon={Plus}
          title="Add API"
          description="Connect new data source"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <ActionButton
          to={createPageUrl("Data")}
          icon={Database}
          title="Browse Data"
          description="Explore API responses"
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <ActionButton
          to={createPageUrl("Exports")}
          icon={Download}
          title="Export Data"
          description="Download for designs"
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        
        <div className="pt-3 border-t border-slate-100">
          <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-slate-900 mb-1">Getting Started</h4>
                <p className="text-xs text-slate-600">
                  Connect your first API to begin using real data in your designs
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}