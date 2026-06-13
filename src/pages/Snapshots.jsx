import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Camera, 
  Star, 
  Download,
  Trash2,
  Database,
  Tag,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function Snapshots() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['snapshots'],
    queryFn: () => base44.entities.DataSnapshot.list("-created_date")
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.APIConnection.list()
  });

  const toggleFavorite = useMutation({
    mutationFn: async (snapshot) => {
      return base44.entities.DataSnapshot.update(snapshot.id, {
        ...snapshot,
        is_favorite: !snapshot.is_favorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
    }
  });

  const deleteSnapshot = useMutation({
    mutationFn: (id) => base44.entities.DataSnapshot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapshots'] });
    }
  });

  const downloadSnapshot = (snapshot) => {
    const blob = new Blob([JSON.stringify(snapshot.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${snapshot.name}-${snapshot.version || 'v1'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSnapshots = snapshots.filter(snapshot =>
    snapshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snapshot.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const favoriteSnapshots = filteredSnapshots.filter(s => s.is_favorite);
  const regularSnapshots = filteredSnapshots.filter(s => !s.is_favorite);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Snapshots</h1>
            <p className="text-slate-600">Save and version your API data captures</p>
          </div>
        </div>

        <Input
          placeholder="Search snapshots by name or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white/80"
        />

        {favoriteSnapshots.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteSnapshots.map(snapshot => (
                <SnapshotCard 
                  key={snapshot.id}
                  snapshot={snapshot}
                  connection={connections.find(c => c.id === snapshot.api_connection_id)}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteSnapshot}
                  onDownload={downloadSnapshot}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            All Snapshots
          </h2>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : regularSnapshots.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <Camera className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No snapshots yet</h3>
                <p className="text-slate-600">Create snapshots from the Data Browser</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularSnapshots.map(snapshot => (
                <SnapshotCard 
                  key={snapshot.id}
                  snapshot={snapshot}
                  connection={connections.find(c => c.id === snapshot.api_connection_id)}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteSnapshot}
                  onDownload={downloadSnapshot}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SnapshotCard({ snapshot, connection, onToggleFavorite, onDelete, onDownload }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{snapshot.name}</CardTitle>
            <p className="text-sm text-slate-600">
              From: {connection?.name || 'Unknown API'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite.mutate(snapshot)}
          >
            <Star className={`w-4 h-4 ${snapshot.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {snapshot.version && (
          <Badge variant="outline">v{snapshot.version}</Badge>
        )}
        
        {snapshot.tags && snapshot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {snapshot.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{format(new Date(snapshot.created_date), "MMM d, yyyy")}</span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(snapshot)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete snapshot?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{snapshot.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete.mutate(snapshot.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}