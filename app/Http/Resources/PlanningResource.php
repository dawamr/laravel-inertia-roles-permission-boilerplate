<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanningResource extends JsonResource
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
            'nama_planning' => $this->nama_planning,
            'tanggal_mulai' => $this->tanggal_mulai,
            'tanggal_selesai' => $this->tanggal_selesai,
            'total_order' => $this->total_order,
            'status' => $this->status,
            'description' => $this->description,
            'orders_count' => $this->orders_count ?? 0,
            'total_qty_pcs' => $this->total_qty_pcs ?? 0,
            'total_kg' => $this->total_kg ?? 0,
            'progress_percentage' => $this->progress_percentage ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Additional computed fields
            'duration_days' => $this->duration_days ?? $this->calculateDurationDays(),
            'status_label' => $this->getStatusLabel(),
            'formatted_period' => $this->getFormattedPeriod(),
            'is_active' => $this->isActive(),
            'is_upcoming' => $this->isUpcoming(),
            'is_finished' => $this->isFinished(),
        ];
    }

    /**
     * Calculate duration in days
     */
    private function calculateDurationDays(): int
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return 0;
        }

        $start = \Carbon\Carbon::parse($this->tanggal_mulai);
        $end = \Carbon\Carbon::parse($this->tanggal_selesai);

        return $end->diffInDays($start) + 1;
    }

    /**
     * Get localized status label
     */
    private function getStatusLabel(): string
    {
        return match($this->status) {
            'Draft' => 'Draft',
            'Scheduled' => 'Terjadwal',
            'In Progress' => 'Berlangsung',
            'Finished' => 'Selesai',
            default => $this->status
        };
    }

    /**
     * Get formatted period string
     */
    private function getFormattedPeriod(): string
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return '-';
        }

        $start = \Carbon\Carbon::parse($this->tanggal_mulai)->locale('id');
        $end = \Carbon\Carbon::parse($this->tanggal_selesai)->locale('id');

        return $start->format('d M Y') . ' - ' . $end->format('d M Y');
    }

    /**
     * Check if planning is currently active
     */
    private function isActive(): bool
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return false;
        }

        $now = now();
        $start = \Carbon\Carbon::parse($this->tanggal_mulai);
        $end = \Carbon\Carbon::parse($this->tanggal_selesai);

        return $now->between($start, $end) && $this->status === 'In Progress';
    }

    /**
     * Check if planning is upcoming
     */
    private function isUpcoming(): bool
    {
        if (!$this->tanggal_mulai) {
            return false;
        }

        $now = now();
        $start = \Carbon\Carbon::parse($this->tanggal_mulai);

        return $now->lt($start) && in_array($this->status, ['Scheduled', 'Draft']);
    }

    /**
     * Check if planning is finished
     */
    private function isFinished(): bool
    {
        if (!$this->tanggal_selesai) {
            return false;
        }

        $now = now();
        $end = \Carbon\Carbon::parse($this->tanggal_selesai);

        return $now->gt($end) || $this->status === 'Finished';
    }
}
