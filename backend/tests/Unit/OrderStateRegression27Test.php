<?php

namespace Tests\Unit;

use App\Services\OrderStateService;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OrderStateRegression27Test extends TestCase
{
    #[DataProvider('cases')]
    public function test_transition_matrix_regression(string $from, string $to, bool $expected): void
    {
        $svc = app(OrderStateService::class);
        $this->assertSame($expected, $svc->canTransition($from, $to), "{$from}->{$to}");
    }

    public static function cases(): array
    {
        return [
            ['new', 'preparing', true],
            ['new', 'ready', false],
            ['new', 'served', false],
            ['new', 'paid', true],
            ['new', 'canceled', true],
            ['new', 'new', false],

            ['preparing', 'new', false],
            ['preparing', 'ready', true],
            ['preparing', 'served', false],
            ['preparing', 'paid', true],
            ['preparing', 'canceled', true],

            ['ready', 'new', false],
            ['ready', 'preparing', false],
            ['ready', 'served', true],
            ['ready', 'paid', true],
            ['ready', 'canceled', true],

            ['served', 'new', false],
            ['served', 'preparing', false],
            ['served', 'ready', false],
            ['served', 'paid', true],
            ['served', 'canceled', false],

            ['paid', 'new', false],
            ['paid', 'preparing', false],
            ['paid', 'ready', false],
            ['paid', 'served', false],
            ['paid', 'canceled', false],

            ['canceled', 'paid', false],
        ];
    }
}
