'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AIAnalysisModal } from '@/components/ai-analysis-modal';
import { 
  getProperty, 
  getUserShareBalance, 
  getPropertySharesMinted,
  purchaseShares,
  sellShares,
  calculateTotalInvestment,
  formatEther,
  parseEther
} from '@/contract/functions';

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUri: string;
  totalShares: bigint;
  pricePerShare: bigint;
  rentalYield: bigint;
  propertyOwner: string;
  isActive: boolean;
}

export default function PropertyDetails() {
  const { id } = useParams() as { id?: string };
  const { address } = useAccount();
  const [property, setProperty] = useState<Property | null>(null);
  const [userShares, setUserShares] = useState<bigint>(BigInt(0));
  const [sharesMinted, setSharesMinted] = useState<bigint>(BigInt(0));
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [transactionAmount, setTransactionAmount] = useState<string>('1');
  const [isTransactionPending, setIsTransactionPending] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    fetchPropertyData();
  }, [id, address]);

  const fetchPropertyData = async () => {
    try {
      // Get property data from blockchain
      const propertyId = BigInt(id!);
      const propertyData = await getProperty(propertyId);
      setProperty({ ...propertyData, id: id! });

      // Get shares minted
      const minted = await getPropertySharesMinted(propertyId);
      setSharesMinted(minted);

      // Get user shares if address is connected
      if (address) {
        const userBalance = await getUserShareBalance(address, propertyId);
        setUserShares(userBalance);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setProperty(null);
    }
  };

  const handleTransaction = async () => {
    if (!property || !address) {
      toast({ 
        title: 'Wallet not connected', 
        description: 'Please connect your wallet to trade shares.',
        variant: 'destructive'
      });
      return;
    }

    const amount = BigInt(transactionAmount);
    const availableShares = property.totalShares - sharesMinted;

    if (amount <= 0) {
      toast({ 
        title: 'Invalid amount', 
        description: 'Please enter a positive number of shares.' 
      });
      return;
    }

    if (isBuying && amount > availableShares) {
      toast({ 
        title: 'Not enough shares', 
        description: 'Requested more shares than available.' 
      });
      return;
    }

    if (!isBuying && amount > userShares) {
      toast({ 
        title: 'Not enough shares', 
        description: 'You do not own that many shares.' 
      });
      return;
    }

    setIsTransactionPending(true);

    try {
      const propertyId = BigInt(id!);

      if (isBuying) {
        const totalCost = calculateTotalInvestment(property.pricePerShare, amount);
        
        toast({
          title: "Purchasing shares...",
          description: "Please confirm the transaction in your wallet.",
        });

        await purchaseShares(propertyId, amount, totalCost);
        
        toast({ 
          title: 'Purchase successful', 
          description: `Bought ${amount.toString()} shares.` 
        });
      } else {
        toast({
          title: "Selling shares...",
          description: "Please confirm the transaction in your wallet.",
        });

        await sellShares(propertyId, amount);
        
        toast({ 
          title: 'Sale successful', 
          description: `Sold ${amount.toString()} shares.` 
        });
      }

      // Refresh data after successful transaction
      await fetchPropertyData();

    } catch (err: any) {
      console.error('Transaction error:', err);
      toast({ 
        title: 'Transaction failed', 
        description: err.message || 'Something went wrong.' 
      });
    } finally {
      setIsTransactionPending(false);
    }
  };

  if (!property) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{'Property not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Image */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <img
            src={property.imageUri}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <Badge
            className="absolute top-4 right-4"
            variant="default"
          >
            Property
          </Badge>
        </div>

        {/* Property Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center text-muted-foreground mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>

          <p className="text-gray-600">{property.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Price per Share</p>
                <p className="text-2xl font-semibold">{formatEther(property.pricePerShare)} ETH</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Available Shares</p>
                <p className="text-2xl font-semibold">{(property.totalShares - sharesMinted).toString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Your Shares</p>
                <p className="text-2xl font-semibold">{userShares.toString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Rental Yield</p>
                <p className="text-2xl font-semibold text-green-600 flex items-center">
                  {(Number(property.rentalYield) / 100).toFixed(1)}%
                  <TrendingUp className="h-4 w-4 ml-1" />
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis and Price Prediction */}
          <div className="grid grid-cols-2 gap-4">
            <AIAnalysisModal 
              propertyId={property.id} 
              propertyData={{
                name: property.name,
                location: property.location,
                type: 'Commercial', // Default type
                price_per_share: parseFloat(formatEther(property.pricePerShare))
              }}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://price-prediction-59gg.onrender.com', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Try Price Prediction
            </Button>
          </div>

          {/* Trading Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Trade Shares</h3>
              <div className="flex space-x-4 mb-4">
                <Button
                  variant={isBuying ? "default" : "outline"}
                  onClick={() => setIsBuying(true)}
                  className="flex-1"
                >
                  Buy
                </Button>
                <Button
                  variant={!isBuying ? "default" : "outline"}
                  onClick={() => setIsBuying(false)}
                  className="flex-1"
                >
                  Sell
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Number of Shares</label>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                    min="1"
                    max={isBuying ? (property.totalShares - sharesMinted).toString() : userShares.toString()}
                  />
                </div>
                <Button
                  onClick={handleTransaction}
                  disabled={isTransactionPending}
                  className="w-full"
                >
                  {isTransactionPending ? 'Processing...' : isBuying ? 'Buy Shares' : 'Sell Shares'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
} 