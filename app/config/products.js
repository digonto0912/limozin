// Product configuration for Save Way Limousine parent company
// Each product has its own Firestore collections and branding

export const PRODUCTS = [
  {
    id: 'save-way-limousine',
    name: 'Save Way Limousine',
    shortName: 'SWL',
    color: '#4361ee',
    icon: '🚗',
    logo: '/save-way-limousine.png',
    description: 'Limousine services management',
    collections: {
      records: 'records',              // Keep existing collection for backward compat
      paymentHistory: 'paymentHistory' // Keep existing collection for backward compat
    }
  },
  {
    id: 'rrn-trading',
    name: 'RRN Trading And Contracting',
    shortName: 'RRN',
    color: '#10b981',
    icon: '📦',
    logo: '/RRN.png',
    description: 'Trading and contracting operations',
    collections: {
      records: 'rrn_records',
      paymentHistory: 'rrn_paymentHistory'
    }
  },
  {
    id: 'save-sky-trading',
    name: 'Save Sky Trading And Contracting',
    shortName: 'SST',
    color: '#8b5cf6',
    icon: '✈️',
    logo: '/SKT.png',
    description: 'Trading and contracting operations',
    collections: {
      records: 'save_sky_records',
      paymentHistory: 'save_sky_paymentHistory'
    }
  },
  {
    id: 'city-block-delivery',
    name: 'City Block Delivery',
    shortName: 'CBD',
    color: '#f59e0b',
    icon: '🚚',
    logo: '/CBD.png',
    description: 'Delivery services management',
    collections: {
      records: 'city_block_records',
      paymentHistory: 'city_block_paymentHistory'
    }
  }
];

export const DEFAULT_PRODUCT_ID = 'save-way-limousine';

/**
 * Get product config by ID
 * @param {string} productId - The product slug/ID
 * @returns {object|null} Product config or null
 */
export const getProductById = (productId) => {
  return PRODUCTS.find(p => p.id === productId) || null;
};

/**
 * Get Firestore collection name for a product
 * @param {string} productId - The product slug/ID
 * @param {string} collectionType - 'records' or 'paymentHistory'
 * @returns {string} The Firestore collection name
 */
export const getCollectionName = (productId, collectionType) => {
  const product = getProductById(productId);
  if (!product) {
    console.warn(`Unknown product: ${productId}, falling back to default collections`);
    return collectionType; // fallback to base collection names
  }
  return product.collections[collectionType] || collectionType;
};

/**
 * Validate that a product ID is valid
 * @param {string} productId
 * @returns {boolean}
 */
export const isValidProduct = (productId) => {
  return PRODUCTS.some(p => p.id === productId);
};
