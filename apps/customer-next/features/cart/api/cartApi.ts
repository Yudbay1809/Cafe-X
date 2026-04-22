import { api } from '@/services/api';

export const cartApi = {
  placeOrder: (payload: { table_token: string; notes?: string; items: Array<{ product_id: number; qty: number; notes?: string }> }) =>
    api.post('/qr/place-order', payload, {
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    }),
    
  getOrderStatus: (tableToken: string, orderId: number) => 
    api.get(`/qr/order-status/${tableToken}/${orderId}`),

  applyVoucher: (payload: { table_token: string; order_id: number; code: string }) =>
    api.post('/qr/apply-voucher', payload),

  validateVoucher: (payload: { code: string; subtotal: number }) =>
    api.post('/qr/validate-voucher', payload),

  lookupMember: (phone: string) => 
    api.get(`/qr/lookup-member?phone=${phone}`),

  applyMember: (payload: { order_id: number; phone: string }) => 
    api.post('/qr/apply-member', payload),

  redeemPoints: (payload: { order_id: number; points: number }) => 
    api.post('/qr/redeem-points', payload),

  submitFeedback: (payload: { order_id: number; rating: number; comment?: string }) => 
    api.post('/qr/order-feedback', payload),

  getRecommendations: (product_ids: number[]) => 
    api.post('/qr/recommendations', { product_ids }),
};
