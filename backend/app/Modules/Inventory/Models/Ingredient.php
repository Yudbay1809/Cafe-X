<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ingredient extends Model
{
    protected $table = 'inventory_ingredients';

    protected $fillable = [
        'tenant_id',
        'outlet_id',
        'name',
        'unit',
        'category',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
        'cost_per_unit',
        'supplier_name',
        'supplier_contact',
        'is_active',
    ];

    protected $casts = [
        'current_stock' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Check if stock is below minimum
     */
    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->minimum_stock;
    }

    /**
     * Check if stock is out
     */
    public function isOutOfStock(): bool
    {
        return $this->current_stock <= 0;
    }

    /**
     * Get stock percentage
     */
    public function getStockPercentage(): float
    {
        if ($this->maximum_stock <= 0) return 0;
        return min(100, ($this->current_stock / $this->maximum_stock) * 100);
    }
}