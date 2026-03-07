<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class OutletBrandUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'brand_color' => ['nullable', 'string', 'max:12'],
            'brand_name' => ['nullable', 'string', 'max:120'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
        ];
    }
}
