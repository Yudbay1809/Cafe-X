<?php

namespace App\Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recipe extends Model
{
    protected $table = 'inventory_recipes';

    protected $fillable = [
        'product_id',
        'ingredient_id',
        'quantity',
        'unit',
        'is_active',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    /**
     * Calculate ingredient cost for this recipe
     */
    public function getCostAttribute(): float
    {
        return (float) ($this->quantity * $this->ingredient->cost_per_unit);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}