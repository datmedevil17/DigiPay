'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import { 
  getUserProperties, 
  getUserShareBalance, 
  getProperty, 
  formatEther 
} from '@/contract/functions';

interface UserPropertyData {
  propertyId: bigint;
  shares: bigint;
  propertyInfo: {
    name: string;
    location: string;
    imageUri: string;
    pricePerShare: bigint;
    rentalYield: bigint;
  };
}

export function UserPortfolio() {
  const { address } = useAccount();
  const [userProperties, setUserProperties] = useState<UserPropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchUserPortfolio();
    }
  }, [address]);

  const fetchUserPortfolio = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // Get user's property IDs
      const propertyIds = await getUserProperties(address);
      
      // Get detailed info for each property
      const portfolioData: UserPropertyData[] = [];
      
      for (const propertyId of propertyIds) {
        try {
          const [shares, propertyInfo] = await Promise.all([
            getUserShareBalance(address, propertyId),
            getProperty(propertyId)
          ]);
          
          if (shares > 0) {
            portfolioData.push({
              propertyId,
              shares,
              propertyInfo
            });
          }
        } catch (error) {
          console.error(`Error fetching data for property ${propertyId}:`, error);
        }
      }
      
      setUserProperties(portfolioData);
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return userProperties.reduce((total, property) => {
      const shareValue = Number(formatEther(property.propertyInfo.pricePerShare));
      const shares = Number(property.shares);
      return total + (shareValue * shares);
    }, 0);
  };

  const calculateTotalShares = () => {
    return userProperties.reduce((total, property) => {
      return total + Number(property.shares);
    }, 0);
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-500">
          Connect your wallet to view your property portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            <p className="text-2xl font-semibold">{calculateTotalValue().toFixed(4)} ETH</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Properties Owned</p>
            <p className="text-2xl font-semibold">{userProperties.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Shares</p>
            <p className="text-2xl font-semibold">{calculateTotalShares()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Property List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Properties
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUserPortfolio}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : userProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No properties in your portfolio yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start investing in properties to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userProperties.map((property) => (
                <div
                  key={property.propertyId.toString()}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={property.propertyInfo.imageUri}
                      alt={property.propertyInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{property.propertyInfo.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {property.propertyInfo.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{property.shares.toString()} shares</p>
                    <p className="text-sm text-muted-foreground">
                      {formatEther(property.propertyInfo.pricePerShare)} ETH each
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="flex items-center">
                      {(Number(property.propertyInfo.rentalYield) / 100).toFixed(1)}%
                      <TrendingUp className="h-3 w-3 ml-1" />
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
