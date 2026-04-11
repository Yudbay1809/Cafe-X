<?php

namespace App\Modules\Delivery\DTO;

use InvalidArgumentException;

class DeliveryOrderDTO
{
    public function __construct(
        public readonly int $orderId,
        public readonly string $orderNo,
        public readonly array $items,
        public readonly float $subtotal,
        public readonly float $taxAmount,
        public readonly float $serviceAmount,
        public readonly float $totalAmount,
        public readonly string $deliveryAddress,
        public readonly ?string $customerName = null,
        public readonly ?string $customerPhone = null,
        public readonly ?string $notes = null,
        public readonly ?string $externalOrderId = null,
    ) {
        if ($orderId < 1) {
            throw new InvalidArgumentException('Order ID must be positive');
        }
        if (empty($orderNo)) {
            throw new InvalidArgumentException('Order number is required');
        }
        if (empty($items)) {
            throw new InvalidArgumentException('Order items are required');
        }
        if ($totalAmount < 0) {
            throw new InvalidArgumentException('Total amount cannot be negative');
        }
    }

    public function toArray(): array
    {
        return [
            'order_id' => $this->orderId,
            'order_no' => $this->orderNo,
            'items' => $this->items,
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->taxAmount,
            'service_amount' => $this->serviceAmount,
            'total_amount' => $this->totalAmount,
            'delivery_address' => $this->deliveryAddress,
            'customer_name' => $this->customerName,
            'customer_phone' => $this->customerPhone,
            'notes' => $this->notes,
            'external_order_id' => $this->externalOrderId,
        ];
    }

    public static function fromOrder(array $order, array $items): self
    {
        return new self(
            orderId: (int) $order['id'],
            orderNo: (string) $order['order_no'],
            items: $items,
            subtotal: (float) ($order['subtotal'] ?? 0),
            taxAmount: (float) ($order['tax_amount'] ?? 0),
            serviceAmount: (float) ($order['service_amount'] ?? 0),
            totalAmount: (float) ($order['total_amount'] ?? 0),
            deliveryAddress: (string) ($order['delivery_address'] ?? ''),
            customerName: $order['customer_name'] ?? null,
            customerPhone: $order['customer_phone'] ?? null,
            notes: $order['notes'] ?? null,
            externalOrderId: $order['external_order_id'] ?? null,
        );
    }
}