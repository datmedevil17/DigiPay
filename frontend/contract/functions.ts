import { readContract, writeContract, waitForTransactionReceipt, getAccount } from "@wagmi/core";
import abi from "./Properties.json";
import { config } from "./config";


const CONTRACT_ADDRESS = "0x42d8965EcA26A7DebCB9714d33Ad3Fea5e348e85" as `0x${string}`;

// Connection helper function
export const checkConnection = () => {
  const account = getAccount(config);
  if (!account.isConnected) {
    throw new Error("Please connect your wallet to perform this action");
  }
  if (!account.address) {
    throw new Error("No wallet address found. Please reconnect your wallet");
  }
  return account;
};

/**
 * Check if wallet is connected (non-throwing version)
 */
export const isWalletConnected = (): boolean => {
  try {
    const account = getAccount(config);
    return account.isConnected && !!account.address;
  } catch {
    return false;
  }
};

// Types
export interface Property {
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

export interface ListPropertyParams {
  name: string;
  location: string;
  description: string;
  imageUri: string;
  totalShares: bigint;
  pricePerShare: bigint;
  rentalYield: bigint;
}

// Property Management Functions

/**
 * List a new property on the platform
 */
export const listProperty = async (params: ListPropertyParams) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "listProperty",
      args: [
        params.name,
        params.location,
        params.description,
        params.imageUri,
        params.totalShares,
        params.pricePerShare,
        params.rentalYield,
      ],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error listing property:", error);
    throw error;
  }
};

/**
 * Update an existing property
 */
export const updateProperty = async (
  propertyId: bigint,
  params: ListPropertyParams & { isActive: boolean }
) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "updateProperty",
      args: [
        propertyId,
        params.name,
        params.location,
        params.description,
        params.imageUri,
        params.pricePerShare,
        params.rentalYield,
        params.isActive,
      ],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

/**
 * Set property status (active/inactive)
 */
export const setPropertyStatus = async (propertyId: bigint, isActive: boolean) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "setPropertyStatus",
      args: [propertyId, isActive],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error setting property status:", error);
    throw error;
  }
};

/**
 * Update price per share for a property
 */
export const updatePricePerShare = async (propertyId: bigint, newPricePerShare: bigint) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "updatePricePerShare",
      args: [propertyId, newPricePerShare],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error updating price per share:", error);
    throw error;
  }
};

// Share Trading Functions

/**
 * Purchase shares of a property
 */
export const purchaseShares = async (propertyId: bigint, amount: bigint, totalValue: bigint) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "purchaseShares",
      args: [propertyId, amount],
      value: totalValue, // ETH amount to send
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error purchasing shares:", error);
    throw error;
  }
};

/**
 * Sell shares of a property
 */
export const sellShares = async (propertyId: bigint, amount: bigint) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "sellShares",
      args: [propertyId, amount],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error selling shares:", error);
    throw error;
  }
};

// Read Functions

/**
 * Get all properties
 */
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getAllProperties",
    });
    return result as Property[];
  } catch (error) {
    console.error("Error getting all properties:", error);
    throw error;
  }
};

/**
 * Get active properties only
 */
export const getActiveProperties = async (): Promise<Property[]> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getActiveProperties",
    });
    return result as Property[];
  } catch (error) {
    console.error("Error getting active properties:", error);
    throw error;
  }
};

/**
 * Get a specific property by ID
 */
export const getProperty = async (propertyId: bigint): Promise<Property> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getProperty",
      args: [propertyId],
    });
    return result as Property;
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
};

/**
 * Get total property count
 */
export const getPropertyCount = async (): Promise<bigint> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getPropertyCount",
    });
    return result as bigint;
  } catch (error) {
    console.error("Error getting property count:", error);
    throw error;
  }
};

/**
 * Get property ETH balance
 */
export const getPropertyEthBalance = async (propertyId: bigint): Promise<bigint> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getPropertyEthBalance",
      args: [propertyId],
    });
    return result as bigint;
  } catch (error) {
    console.error("Error getting property ETH balance:", error);
    throw error;
  }
};

/**
 * Get shares minted for a property
 */
export const getPropertySharesMinted = async (propertyId: bigint): Promise<bigint> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getPropertySharesMinted",
      args: [propertyId],
    });
    return result as bigint;
  } catch (error) {
    console.error("Error getting property shares minted:", error);
    throw error;
  }
};

// User-specific Functions

/**
 * Get user's properties (properties they own shares in)
 */
export const getUserProperties = async (userAddress: string): Promise<bigint[]> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getUserProperties",
      args: [userAddress as `0x${string}`],
    });
    return result as bigint[];
  } catch (error) {
    console.error("Error getting user properties:", error);
    throw error;
  }
};

/**
 * Get user's share balance for a specific property
 */
export const getUserShareBalance = async (userAddress: string, propertyId: bigint): Promise<bigint> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "getUserShareBalance",
      args: [userAddress as `0x${string}`, propertyId],
    });
    return result as bigint;
  } catch (error) {
    console.error("Error getting user share balance:", error);
    throw error;
  }
};

/**
 * Get balance of specific token for user (ERC1155)
 */
export const getBalanceOf = async (userAddress: string, tokenId: bigint): Promise<bigint> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`, tokenId],
    });
    return result as bigint;
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

// ERC1155 Functions

/**
 * Set approval for all tokens
 */
export const setApprovalForAll = async (operator: string, approved: boolean) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "setApprovalForAll",
      args: [operator as `0x${string}`, approved],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error setting approval for all:", error);
    throw error;
  }
};

/**
 * Check if operator is approved for all tokens
 */
export const isApprovedForAll = async (owner: string, operator: string): Promise<boolean> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "isApprovedForAll",
      args: [owner as `0x${string}`, operator as `0x${string}`],
    });
    return result as boolean;
  } catch (error) {
    console.error("Error checking approval:", error);
    throw error;
  }
};

/**
 * Safe transfer from (single token)
 */
export const safeTransferFrom = async (
  from: string,
  to: string,
  tokenId: bigint,
  amount: bigint,
  data: string = "0x"
) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "safeTransferFrom",
      args: [
        from as `0x${string}`,
        to as `0x${string}`,
        tokenId,
        amount,
        data as `0x${string}`,
      ],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error transferring token:", error);
    throw error;
  }
};

// Financial Functions

/**
 * Withdraw property funds (for property owners)
 */
export const withdrawPropertyFunds = async (propertyId: bigint, amount: bigint) => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "withdrawPropertyFunds",
      args: [propertyId, amount],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error withdrawing property funds:", error);
    throw error;
  }
};

// Admin Functions

/**
 * Pause the contract (owner only)
 */
export const pauseContract = async () => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "pause",
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error pausing contract:", error);
    throw error;
  }
};

/**
 * Unpause the contract (owner only)
 */
export const unpauseContract = async () => {
  try {
    const account = checkConnection();

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "unpause",
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return { success: true, hash, receipt };
  } catch (error) {
    console.error("Error unpausing contract:", error);
    throw error;
  }
};

/**
 * Check if contract is paused
 */
export const isPaused = async (): Promise<boolean> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "paused",
    });
    return result as boolean;
  } catch (error) {
    console.error("Error checking pause status:", error);
    throw error;
  }
};

/**
 * Get contract owner
 */
export const getOwner = async (): Promise<string> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: abi.abi,
      functionName: "owner",
    });
    return result as string;
  } catch (error) {
    console.error("Error getting owner:", error);
    throw error;
  }
};

// Utility Functions

/**
 * Calculate total investment for purchasing shares
 */
export const calculateTotalInvestment = (pricePerShare: bigint, amount: bigint): bigint => {
  return pricePerShare * amount;
};

/**
 * Format wei to ether for display
 */
export const formatEther = (wei: bigint): string => {
  return (Number(wei) / 1e18).toFixed(4);
};

/**
 * Parse ether to wei
 */
export const parseEther = (ether: string): bigint => {
  return BigInt(Math.floor(parseFloat(ether) * 1e18));
};