'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PropertySkeleton } from '@/components/property-skeleton';
import { CreatePropertyModal } from '@/components/create-property-modal';
import { useProperties } from '@/hooks/use-properties';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  price_per_share: number;
  total_shares: number;
  available_shares: number;
  rental_yield: number;
  type: 'Commercial' | 'Residential';
  owner_id: string;
}

interface Valuation {
  predicted_value: number;
  predicted_roi: number;
  market_trend: string;
  confidence_score: number;
  location_score: number;
  market_demand: string;
  growth_potential: string;
  last_updated: string;
}

export default function PropertiesPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [propertyValuations, setPropertyValuations] = useState<Record<string, Valuation>>({});
  const { data: properties, isLoading, error, mutate } = useProperties();









  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Properties</h1>
        <div className="flex justify-end">
          <CreatePropertyModal onPropertyCreated={mutate} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties?.map((property) => (
          <Card
            key={property.id}
            className={cn(
              "overflow-hidden transition-all duration-300 cursor-pointer",
              hoveredCard === property.id ? "transform scale-[1.02] shadow-lg" : "",
            )}
            onMouseEnter={() => setHoveredCard(property.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={property.image_url || "/placeholder.svg"}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <Badge
                className="absolute top-3 right-3"
                variant={property.type === "Commercial" ? "default" : "secondary"}
              >
                {property.type}
              </Badge>
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Token Price</p>
                  <p className="font-semibold">${property.price_per_share}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Projected ROI</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                    {propertyValuations[property.id] ? 
                      `+${propertyValuations[property.id].predicted_roi}%` : 
                      `+${property.rental_yield}%`
                    }
                    <TrendingUp className="h-4 w-4 ml-1" />
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/properties/${property.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 