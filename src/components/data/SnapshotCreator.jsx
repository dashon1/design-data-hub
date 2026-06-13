import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SnapshotCreator({ connection, data, onSuccess }) {
  const [name, setName] = useState(`${connection.name} Snapshot`);
  const [version, setVersion] = useState("1.0");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const queryClient = useQueryClient();

  const createSnapshot = useMutation({
    mutationFn: async () => {
      const snapshot = await base44.entities.DataSnapshot.create({
        name,
        api_connection_id: connection.id,
        data,
        metadata: {
          record_count: data.data?.length || 0,
          created_from: "data_browser"
        },
        version,
        is_favorite: false,
        tags
      });

      await base44.entities.ActivityLog.create({
        action: "snapshot_created",
        entity_type: "DataSnapshot",
        entity_id: snapshot.id,
        details: { name, api: connection.name }
      });

      return snapshot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
      if (onSuccess) onSuccess();
    }
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Camera className="w-5 h-5" />
          Create Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="snapshot-name">Snapshot Name</Label>
          <Input
            id="snapshot-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., User Data v1.0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0"
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
            />
            <Button type="button" variant="outline" size="icon" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => createSnapshot.mutate()}
          disabled={createSnapshot.isPending || !name}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Camera className="w-4 h-4 mr-2" />
          {createSnapshot.isPending ? "Creating..." : "Create Snapshot"}
        </Button>
      </CardContent>
    </Card>
  );
}