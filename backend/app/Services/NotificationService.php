<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    /**
     * Mengirim notifikasi WhatsApp ke pelanggan.
     * Saat ini menggunakan mode 'mock' (catat ke log). 
     * Mudah dihubungkan ke vendor seperti Fonnte atau Twilio.
     */
    public function sendWhatsApp(string $phone, string $message): bool
    {
        if (empty($phone)) return false;

        // Bersihkan format nomor (pastikan depannya 62 atau format internasional)
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        Log::info("WhatsApp Notification Task:", [
            'to' => $phone,
            'message' => $message,
            'status' => 'mock_sent'
        ]);

        // Implementasi nyata (Contoh Fonnte):
        /*
        Http::withHeaders([
            'Authorization' => config('services.fonnte.token'),
        ])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => $message,
        ]);
        */

        return true;
    }

    public function notifyOrderReady(int $orderId): void
    {
        $order = \DB::table('pos_orders')->where('id', $orderId)->first();
        if (!$order || empty($order->member_id)) {
             // Cek jika ada nomor HP di order metadata (jika diinput saat QR)
             // Dalam implementasi kita sebelumnya, member_id diisi jika phone diinput
        }

        $customer = \DB::table('customers')->where('id', $order->member_id)->first();
        if (!$customer || !$customer->phone) return;

        $msg = "Halo {$customer->name}! Pesanan kamu #{$order->order_no} di Cafe-X sudah SIAP diambil. Silakan menuju counter kami. Terima kasih!";
        
        $this->sendWhatsApp($customer->phone, $msg);
    }
}
