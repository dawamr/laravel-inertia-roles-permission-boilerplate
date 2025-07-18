<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'no_po' => $this->no_po,
            'product_system' => $this->product_system,
            'merk' => $this->merk,
            'customer' => $this->customer,
            'lapisan' => $this->lapisan,
            'mold_used' => $this->mold_used,
            'kebutuhan_mold' => $this->kebutuhan_mold,
            'qty_order_dos' => $this->qty_order_dos,
            'isi_per_dos' => $this->isi_per_dos,
            'berat_standart' => $this->berat_standart,
            'qty_order_pcs' => $this->qty_order_pcs,
            'total_kg' => $this->total_kg,
            'stok_gudang' => $this->stok_gudang,
            'stock_fg_pcs' => $this->stock_fg_pcs,
            'balance_packing' => $this->balance_packing,
            'balance_stock_pcs' => $this->balance_stock_pcs,
            'balance_stock_kg' => $this->balance_stock_kg,
            
            // Hitung derived values
            'balance_percentage' => $this->calculateBalancePercentage(),
            'urgency_level' => $this->calculateUrgencyLevel(),
            'production_efficiency' => $this->calculateProductionEfficiency(),
            
            // Status and timestamps
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'created_at_formatted' => $this->created_at?->format('d M Y H:i'),
            'updated_at_formatted' => $this->updated_at?->format('d M Y H:i'),
            
            // Relations (if loaded)
            'order_details' => OrderDetailResource::collection($this->whenLoaded('orderDetails')),
        ];
    }

    /**
     * Calculate balance percentage for visual indicators
     */
    private function calculateBalancePercentage(): float
    {
        if ($this->qty_order_pcs <= 0) {
            return 0;
        }

        $availableStock = $this->stok_gudang + $this->stock_fg_pcs;
        return round(($availableStock / $this->qty_order_pcs) * 100, 2);
    }

    /**
     * Calculate urgency level based on balance stock
     */
    private function calculateUrgencyLevel(): string
    {
        $balancePercentage = $this->calculateBalancePercentage();
        
        if ($balancePercentage >= 100) {
            return 'normal';
        } elseif ($balancePercentage >= 50) {
            return 'medium';
        } elseif ($balancePercentage >= 25) {
            return 'high';
        } else {
            return 'critical';
        }
    }

    /**
     * Calculate production efficiency
     */
    private function calculateProductionEfficiency(): float
    {
        if ($this->kebutuhan_mold <= 0) {
            return 0;
        }

        // Simplified efficiency calculation
        $targetEfficiency = $this->qty_order_pcs / $this->kebutuhan_mold;
        return round($targetEfficiency, 2);
    }

    /**
     * Get status label in Indonesian
     */
    private function getStatusLabel(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu',
            'processing' => 'Diproses',
            'urgent' => 'Mendesak',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => 'Tidak Diketahui',
        };
    }
} 