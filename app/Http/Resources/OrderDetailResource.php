<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
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
            'order_id' => $this->order_id,
            'po_number' => $this->po_number,
            'customer' => $this->customer,
            'product_system' => $this->product_system,
            'mold_used' => $this->mold_used,
            'riject_ratio' => $this->riject_ratio,
            'cavity' => $this->cavity,
            'kg_mold' => $this->kg_mold,
            'tipe_core' => $this->tipe_core,
            
            // Order quantities
            'qty_order_dos' => $this->qty_order_dos,
            'isi_per_dos' => $this->isi_per_dos,
            'berat_standart' => $this->berat_standart,
            'qty_order_pcs' => $this->qty_order_pcs,
            'total_kg' => $this->total_kg,
            
            // Production requirements
            'kebutuhan_cetak_pcs' => $this->kebutuhan_cetak_pcs,
            'kebutuhan_mold' => $this->kebutuhan_mold,
            'kebutuhan_cairan' => $this->kebutuhan_cairan,
            'kebutuhan_cetak_kg' => $this->kebutuhan_cetak_kg,
            'kebutuhan_core' => $this->kebutuhan_core,
            'kebutuhan_hari_core' => $this->kebutuhan_hari_core,
            
            // Core production details
            'core_per_mold' => $this->core_per_mold,
            'ct_core' => $this->ct_core,
            'cap_core_per_day' => $this->cap_core_per_day,
            'core_per_batch' => $this->core_per_batch,
            'max_batch_per_day' => $this->max_batch_per_day,
            
            // Calculated values
            'production_days_estimate' => $this->calculateProductionDaysEstimate(),
            'daily_capacity' => $this->calculateDailyCapacity(),
            'efficiency_ratio' => $this->calculateEfficiencyRatio(),
            
            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Calculate estimated production days
     */
    private function calculateProductionDaysEstimate(): float
    {
        if ($this->cap_core_per_day <= 0 || $this->kebutuhan_core <= 0) {
            return 0;
        }
        
        return round($this->kebutuhan_core / $this->cap_core_per_day, 2);
    }

    /**
     * Calculate daily production capacity
     */
    private function calculateDailyCapacity(): int
    {
        if ($this->max_batch_per_day <= 0 || $this->core_per_batch <= 0) {
            return 0;
        }
        
        return $this->max_batch_per_day * $this->core_per_batch;
    }

    /**
     * Calculate production efficiency ratio
     */
    private function calculateEfficiencyRatio(): float
    {
        if ($this->kebutuhan_cetak_pcs <= 0 || $this->qty_order_pcs <= 0) {
            return 0;
        }
        
        // Efficiency based on reject ratio
        $rejectPercentage = (float) str_replace('%', '', $this->riject_ratio);
        $efficiency = (100 - $rejectPercentage) / 100;
        
        return round($efficiency, 2);
    }
} 