'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast'
import { useProperties } from '@/hooks/use-properties'
import { Toaster } from '@/components/ui/toaster';
import { Plus, Upload } from 'lucide-react';
import { listProperty, parseEther, isWalletConnected } from '@/contract/functions';
import { uploadToIpfs } from '@/contract/pinata';
import { useAccount } from 'wagmi';

interface CreatePropertyModalProps {
  onPropertyCreated?: () => void;
}

export function CreatePropertyModal({ onPropertyCreated }: CreatePropertyModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { mutate } = useProperties();
  const { isConnected } = useAccount();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    description: '',
    total_shares: '',
    price_per_share: '',
    rental_yield: '',
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check wallet connection first
      if (!isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to create a property.",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.location || !formData.type || !formData.total_shares || !formData.price_per_share || !formData.rental_yield) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Upload image to IPFS if selected
      let imageUri = 'https://via.placeholder.com/400x300';
      if (selectedImage) {
        try {
          toast({
            title: "Uploading image...",
            description: "Please wait while we upload your image to IPFS.",
          });
          const uploadResult = await uploadToIpfs(selectedImage);
          if (uploadResult) {
            imageUri = uploadResult;
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: "Image Upload Error",
            description: "Failed to upload image. Using placeholder instead.",
            variant: "destructive",
          });
        }
      }

      // Convert values to blockchain format
      const totalShares = BigInt(formData.total_shares);
      const pricePerShareInWei = parseEther(formData.price_per_share);
      const rentalYield = BigInt(Math.floor(parseFloat(formData.rental_yield))); // Store as basis points

      toast({
        title: "Creating property...",
        description: "Please confirm the transaction in your wallet.",
      });

      // Create property on blockchain
      const result = await listProperty({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        imageUri: imageUri,
        totalShares: totalShares,
        pricePerShare: pricePerShareInWei,
        rentalYield: rentalYield,
      });

      toast({
        title: "Success!",
        description: "Property successfully created on the blockchain!",
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        type: '',
        description: '',
        total_shares: '',
        price_per_share: '',
        rental_yield: '',
      });
      setSelectedImage(null);
      setImagePreview('');

      setOpen(false);
      mutate();
      onPropertyCreated?.();
    } catch (error: any) {
      console.error('Property creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Property
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter property name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter property location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Property Image</Label>
              <div className="flex flex-col space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedImage ? 'Change Image' : 'Upload Image'}
                </Button>
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter property description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_shares">Total Shares *</Label>
                <Input
                  id="total_shares"
                  type="number"
                  value={formData.total_shares}
                  onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                  placeholder="1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_share">Price per Share (ETH) *</Label>
                <Input
                  id="price_per_share"
                  type="number"
                  step="0.0001"
                  value={formData.price_per_share}
                  onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                  placeholder="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rental_yield">Annual Rental Yield (%) *</Label>
              <Input
                id="rental_yield"
                type="number"
                step="0.1"
                value={formData.rental_yield}
                onChange={(e) => setFormData({ ...formData, rental_yield: e.target.value })}
                placeholder="8.5"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating...' : 'Create Property'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}