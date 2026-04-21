/**
 * Shared Type Definitions for Cafe-X
 */

export interface Product {
    id_menu: number;
    nama_menu: string;
    jenis_menu: string;
    harga: number;
    stok: number;
    gambar?: string;
    is_active: number;
}

export interface Order {
    id: number;
    order_no: string;
    status: 'pending' | 'preparing' | 'completed' | 'cancelled';
    total_amount: number;
    source: 'POS' | 'WEB';
    created_at: string;
    table_id?: number;
    table_code?: string;
    table_name?: string;
}

export interface Table {
    id: number;
    table_code: string;
    table_name: string;
    is_active: number;
}

export interface User {
    username: string;
    role: string;
    tenant_id?: number;
    outlet_id?: number;
}
