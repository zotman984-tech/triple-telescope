import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Product {
    id: number;
    documentId: string;
    name: string;
    type: string;
    isTopUpAvailable: boolean;
    region: string;
    country: string;
    dataAmountGB: number;
    validityDays: number;
    price: number;
    currency: string;
    countryFlag: string;
    networkSpeed: string;
    provider: string;
}

export const getProducts = async (country?: string): Promise<Product[]> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: Record<string, any> = {
            'populate': '*',
            'pagination[limit]': 100,
        };

        if (country) {
            params['filters[country][$eq]'] = country;
        }

        const response = await api.get<Product[]>('/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};
