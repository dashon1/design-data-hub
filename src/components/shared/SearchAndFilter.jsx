import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchAndFilter({ 
  searchTerm, 
  onSearchChange, 
  category, 
  onCategoryChange,
  showFavorites,
  onToggleFavorites,
  categories = []
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60"
        />
      </div>
      
      {categories.length > 0 && (
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {onToggleFavorites && (
        <Button
          variant={showFavorites ? "default" : "outline"}
          onClick={onToggleFavorites}
          className={showFavorites ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""}
        >
          <Star className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-white' : ''}`} />
          Favorites
        </Button>
      )}
    </div>
  );
}