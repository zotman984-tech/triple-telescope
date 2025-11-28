import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://188.137.254.45:1337';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Product {
    id: number;
    attributes: {
        name: string;
        country: string;
        data: string;
        validity: number;
        price: number;
        currency: string;
        features: string[];
        publishedAt: string;
    };
}

export interface ProductsResponse {
    data: Product[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export const getProducts = async (country?: string): Promise<ProductsResponse> => {
    try {
        const params: any = {
            'filters[publishedAt][$notNull]': true,
            'pagination[limit]': 100,
        };

        if (country) {
            params['filters[country][$eq]'] = country;
        }

        const response = await api.get<ProductsResponse>('/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
    }
};

export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const response = await api.get<{ data: Product }>(`/products/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};
