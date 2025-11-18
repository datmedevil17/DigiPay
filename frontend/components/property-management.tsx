'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'
import { 
  getAllProperties, 
  updatePricePerShare, 
  setPropertyStatus, 
  formatEther, 
  parseEther,
  getPropertySharesMinted,
  getPropertyEthBalance
} from '@/contract/functions';

interface PropertyWithMeta {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUri: string;
  totalShares: bigint;
  pricePerShare: bigint;
  rentalYield: bigint;
  propertyOwner: string;
  isActive: boolean;
  sharesMinted?: bigint;
  ethBalance?: bigint;
}

export function PropertyManagement() {
  const { address } = useAccount();
  const [properties, setProperties] = useState<PropertyWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [updatingProperty, setUpdatingProperty] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (address) {
      fetchOwnedProperties();
    }
  }, [address]);

  const fetchOwnedProperties = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const allProperties = await getAllProperties();
      
      // Filter properties owned by the current user and fetch additional metadata
      const ownedPropertiesWithMeta: PropertyWithMeta[] = [];
      
      for (let i = 0; i < allProperties.length; i++) {
        const property = allProperties[i];
        if (property.propertyOwner.toLowerCase() === address.toLowerCase()) {
          try {
            const [sharesMinted, ethBalance] = await Promise.all([
              getPropertySharesMinted(BigInt(i)),
              getPropertyEthBalance(BigInt(i))
            ]);
            
            ownedPropertiesWithMeta.push({
              id: i,
              ...property,
              sharesMinted,
              ethBalance
            });
          } catch (error) {
            console.error(`Error fetching metadata for property ${i}:`, error);
            ownedPropertiesWithMeta.push({
              id: i,
              ...property,
              sharesMinted: BigInt(0),
              ethBalance: BigInt(0)
            });
          }
        }
      }
      
      setProperties(ownedPropertiesWithMeta);
    } catch (error) {
      console.error('Error fetching owned properties:', error);
      toast({
        title: "Error",
        description: "Failed to load your properties.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePrice = async (propertyId: number) => {
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive"
      });
      return;
    }

    setUpdatingProperty(propertyId);
    try {
      const newPriceWei = parseEther(newPrice);
      
      toast({
        title: "Updating price...",
        description: "Please confirm the transaction in your wallet.",
      });

      await updatePricePerShare(BigInt(propertyId), newPriceWei);
      
      toast({
        title: "Success",
        description: "Property price updated successfully!",
      });

      // Update local state
      setProperties(props => 
        props.map(prop => 
          prop.id === propertyId 
            ? { ...prop, pricePerShare: newPriceWei }
            : prop
        )
      );
      
      setEditingProperty(null);
      setNewPrice('');
    } catch (error: any) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update price.",
        variant: "destructive"
      });
    } finally {
      setUpdatingProperty(null);
    }
  };

  const handleToggleStatus = async (propertyId: number, currentStatus: boolean) => {
    setUpdatingProperty(propertyId);
    try {
      toast({
        title: currentStatus ? "Deactivating property..." : "Activating property...",
        description: "Please confirm the transaction in your wallet.",
      });

      await setPropertyStatus(BigInt(propertyId), !currentStatus);
      
      toast({
        title: "Success",
        description: `Property ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
      });

      // Update local state
      setProperties(props => 
        props.map(prop => 
          prop.id === propertyId 
            ? { ...prop, isActive: !currentStatus }
            : prop
        )
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update property status.",
        variant: "destructive"
      });
    } finally {
      setUpdatingProperty(null);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-500">
          Connect your wallet to manage your properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Property Management
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchOwnedProperties}
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
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You don't own any properties yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create a property to start managing it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border rounded-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img
                        src={property.imageUri}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{property.name}</h3>
                          <p className="text-muted-foreground">{property.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={property.isActive ? "default" : "secondary"}>
                            {property.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={property.isActive}
                            onCheckedChange={() => handleToggleStatus(property.id, property.isActive)}
                            disabled={updatingProperty === property.id}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="font-semibold">{formatEther(property.pricePerShare)} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Shares Sold</p>
                          <p className="font-semibold">
                            {property.sharesMinted?.toString() || '0'} / {property.totalShares.toString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ETH Balance</p>
                          <p className="font-semibold">{formatEther(property.ethBalance || BigInt(0))} ETH</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rental Yield</p>
                          <p className="font-semibold">{(Number(property.rentalYield) / 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      {editingProperty === property.id ? (
                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <Label htmlFor={`price-${property.id}`}>New Price (ETH)</Label>
                            <Input
                              id={`price-${property.id}`}
                              type="number"
                              step="0.0001"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              placeholder="0.01"
                            />
                          </div>
                          <Button
                            onClick={() => handleUpdatePrice(property.id)}
                            disabled={updatingProperty === property.id}
                          >
                            {updatingProperty === property.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Update'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingProperty(null);
                              setNewPrice('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProperty(property.id);
                              setNewPrice(formatEther(property.pricePerShare));
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Update Price
                          </Button>
                        </div>
                      )}
                    </div>
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
