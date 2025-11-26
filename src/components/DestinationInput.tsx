// DestinationInput.tsx
import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";

interface DestinationInputProps {
  onDestinationSet: (lat: number, lng: number, name: string) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export const DestinationInput = ({
  onDestinationSet,
}: DestinationInputProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedQuery
          )}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error searching location:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    onDestinationSet(
      parseFloat(result.lat),
      parseFloat(result.lon),
      result.display_name
    );
    setSearchQuery(result.display_name);
    setShowSuggestions(false);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    // Trigger immediate search logic if needed, 
    // but the effect already handles it via debounce.
    // This button can now serve as a "force select first option" or similar if desired.
    // For now, let's just ensure suggestions are shown.
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-lg overflow-visible relative z-50">
      <div className="flex gap-2" ref={wrapperRef}>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="pl-10 h-12 text-base"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto z-50">
              {suggestions.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm transition-colors border-b last:border-0 border-border/50"
                  onClick={() => handleSelect(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          onClick={handleManualSearch}
          disabled={isSearching || !searchQuery.trim()}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
};
