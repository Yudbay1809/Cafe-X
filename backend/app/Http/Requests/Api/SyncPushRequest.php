<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SyncPushRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_id' => ['nullable','string','max:100'],
            'events' => ['required','array'],
            'events.*.type' => ['required','string','max:100'],
            'events.*.payload' => ['nullable','array'],
        ];
    }
}
