import { api } from '@/services/api';

export const menuApi = {
  getMenu: (tableToken: string) => 
    api.get(`/qr/menu/${tableToken}`),
    
  getPublicMenu: () => 
    api.get('/public/menu'),
    
  getTableTokenByCode: (tableCode: string) => 
    api.get(`/qr/table-token/${encodeURIComponent(tableCode)}`),
};
