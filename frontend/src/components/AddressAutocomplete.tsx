import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { geocodingAPI } from "@/services/api-proxy"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (place: {
    address: string
    placeId: string
    lat?: number
    lng?: number
  }) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address",
  className,
  disabled = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sessionToken, setSessionToken] = useState<string>("")
  const debouncedValue = useDebounce(value, 300)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  
  // Generate a session token for Google Maps API
  useEffect(() => {
    setSessionToken(Math.random().toString(36).substring(2, 15))
  }, [])
  
  // Fetch suggestions when input value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([])
        return
      }
      
      setLoading(true)
      
      try {
        // Use the API proxy
        const response = await geocodingAPI.autocomplete({
          input: debouncedValue,
          session_token: sessionToken
        })
        
        if (response.status === "OK" && response.predictions) {
          setSuggestions(response.predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error)
        // Fallback to mock suggestions
        setSuggestions([
          { description: `${debouncedValue} Road, City`, place_id: "mock1" },
          { description: `${debouncedValue} Street, City`, place_id: "mock2" }
        ])
        setShowSuggestions(true)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuggestions()
  }, [debouncedValue, sessionToken])
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: any) => {
    onChange(suggestion.description)
    setShowSuggestions(false)
    
    if (onSelect) {
      try {
        // Use the API proxy
        const response = await geocodingAPI.placeDetails({
          place_id: suggestion.place_id,
          session_token: sessionToken
        })
        
        if (response.status === "OK" && response.result) {
          onSelect({
            address: response.result.formatted_address || suggestion.description,
            placeId: suggestion.place_id,
            lat: response.result.lat,
            lng: response.result.lng
          })
        } else {
          onSelect({
            address: suggestion.description,
            placeId: suggestion.place_id
          })
        }
      } catch (error) {
        console.error("Error fetching place details:", error)
        onSelect({
          address: suggestion.description,
          placeId: suggestion.place_id
        })
      }
      
      // Generate a new session token after selection
      setSessionToken(Math.random().toString(36).substring(2, 15))
    }
  }
  
  return (
    <div className="relative" ref={autocompleteRef}>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-md">
          <ul className="py-1 text-sm">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 