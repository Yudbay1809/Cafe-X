export type ApiResponse<T> = {
  ok: boolean;
  message: string;
  data: T;
  server_time: string;
};

export type Product = {
  id_menu: number;
  nama_menu: string;
  jenis_menu: string;
  stok: number;
  harga: number;
  gambar?: string;
};

export type TableInfo = {
  table_code: string;
  table_name: string;
  is_active?: boolean;
};

export type CustomerOrder = {
  order_id: number;
  order_no: string;
  status: string;
  total_amount: number;
};
