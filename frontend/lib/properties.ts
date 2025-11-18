import api from './api';
import { getActiveProperties, getPropertyCount, formatEther } from '@/contract/functions';

export interface Property {
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
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
  };
}

// Convert blockchain property to our interface
const convertBlockchainProperty = (blockchainProp: any, index: number): Property => {
  return {
    id: index.toString(),
    name: blockchainProp.name,
    location: blockchainProp.location,
    description: blockchainProp.description,
    image_url: blockchainProp.imageUri,
    price_per_share: parseFloat(formatEther(blockchainProp.pricePerShare)),
    total_shares: Number(blockchainProp.totalShares),
    available_shares: Number(blockchainProp.totalShares), // For now, assume all are available
    rental_yield: Number(blockchainProp.rentalYield) / 100, // Convert from basis points
    type: 'Commercial', // Default type, could be enhanced
    owner_id: blockchainProp.propertyOwner,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const getProperties = async (): Promise<Property[]> => {
  try {
    // Try to get properties from blockchain
    const blockchainProperties = await getActiveProperties();
    return blockchainProperties.map((prop, index) => convertBlockchainProperty(prop, index));
  } catch (error) {
    console.error('Failed to fetch from blockchain, falling back to API:', error);
    // Fallback to API
    try {
      const response = await api.get('/api/properties');
      return response.data;
    } catch (apiError) {
      console.error('API fallback also failed:', apiError);
      return [];
    }
  }
};

export const getPropertyById = async (id: string): Promise<Property> => {
  try {
    // Try to get property from blockchain
    const blockchainProperties = await getActiveProperties();
    const propertyIndex = parseInt(id);
    if (propertyIndex >= 0 && propertyIndex < blockchainProperties.length) {
      return convertBlockchainProperty(blockchainProperties[propertyIndex], propertyIndex);
    }
    throw new Error('Property not found on blockchain');
  } catch (error) {
    console.error('Failed to fetch from blockchain, falling back to API:', error);
    // Fallback to API
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  }
};

export const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'profiles'>): Promise<Property> => {
  const response = await api.post('/api/properties', property);
  return response.data;
}; 