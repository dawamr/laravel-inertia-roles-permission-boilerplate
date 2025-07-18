import React, { useState } from "react";
import FilterBuilder, { evaluateFilters } from "@/Components/FilterBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Badge } from "@/shadcn/ui/badge";
import { formatNumber } from "@/js/Pages/Admin/Planning/utils/planningHelpers";

// Sample data untuk demo
const sampleOrders = [
    {
        id: 1,
        order_number: "PO-001",
        customer: "PT. ABC Industries",
        status: "pending",
        delivery_date: "2024-12-15",
        created_date: "2024-11-01",
        products: [
            { name: "Product A", quantity_kg: 1500, quantity_unit: 500 },
            { name: "Product B", quantity_kg: 2500, quantity_unit: 800 },
        ],
    },
    {
        id: 2,
        order_number: "PO-002",
        customer: "CV. XYZ Trading",
        status: "confirmed",
        delivery_date: "2024-12-20",
        created_date: "2024-11-02",
        products: [
            { name: "Product A", quantity_kg: 1000, quantity_unit: 300 },
        ],
    },
    {
        id: 3,
        order_number: "PO-003",
        customer: "PT. DEF Manufacturing",
        status: "processing",
        delivery_date: "2024-12-25",
        created_date: "2024-11-03",
        products: [{ name: "Product C", quantity_kg: 800, quantity_unit: 200 }],
    },
    {
        id: 4,
        order_number: "SO-004",
        customer: "PT. GHI Corporation",
        status: "pending",
        delivery_date: "2024-12-30",
        created_date: "2024-11-04",
        products: [
            { name: "Product A", quantity_kg: 2000, quantity_unit: 600 },
            { name: "Product D", quantity_kg: 1200, quantity_unit: 400 },
        ],
    },
];

export default function FilterBuilderDemo() {
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filterGroups, setFilterGroups] = useState([]);

    const handleFiltersChange = (newFilterGroups) => {
        setFilterGroups(newFilterGroups);

        if (newFilterGroups.length === 0) {
            setFilteredOrders([]);
        } else {
            const filtered = evaluateFilters(sampleOrders, newFilterGroups);
            setFilteredOrders(filtered);
        }
    };

    const getProductNames = (products) => {
        return products.map((product) => product.name).join(", ");
    };

    const getTotalQuantities = (products) => {
        return products.reduce(
            (totals, product) => ({
                kg: totals.kg + product.quantity_kg,
                unit: totals.unit + product.quantity_unit,
            }),
            { kg: 0, unit: 0 }
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">FilterBuilder Demo</h1>
                <p className="text-gray-600">
                    Demonstration of advanced search filtering capabilities
                </p>
            </div>

            {/* Filter Builder */}
            <FilterBuilder
                onFiltersChange={handleFiltersChange}
                className="max-w-4xl mx-auto"
            />

            {/* Sample Data Overview */}
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Sample Data ({sampleOrders.length} orders)</span>
                        {filterGroups.length > 0 && (
                            <Badge variant="default">
                                {filteredOrders.length} filtered results
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {(filterGroups.length === 0
                            ? sampleOrders
                            : filteredOrders
                        ).map((order) => {
                            const totals = getTotalQuantities(order.products);
                            return (
                                <div
                                    key={order.id}
                                    className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-medium">
                                                {order.order_number}
                                            </span>
                                            <Badge variant="outline">
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(
                                                order.delivery_date
                                            ).toLocaleDateString("id-ID")}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                                        <div>
                                            <span className="font-medium">
                                                Customer:
                                            </span>{" "}
                                            {order.customer}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Products:
                                            </span>{" "}
                                            {getProductNames(order.products)}
                                        </div>
                                        <div>
                                            <span className="font-medium">
                                                Created:
                                            </span>{" "}
                                            {new Date(
                                                order.created_date
                                            ).toLocaleDateString("id-ID")}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                        <span className="text-sm font-medium text-gray-600">
                                            Total Quantities:
                                        </span>
                                        <div className="flex space-x-3 text-sm">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                                {formatNumber(totals.kg)} kg
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                                                {formatNumber(totals.unit)} unit
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filterGroups.length > 0 && filteredOrders.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">
                                No orders match your filter criteria
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try adjusting your filters
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Example Filter Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div className="p-3 bg-blue-50 rounded border">
                            <h4 className="font-medium mb-2">
                                📝 Basic Filter Example:
                            </h4>
                            <p>
                                <strong>Field:</strong> Order Number
                            </p>
                            <p>
                                <strong>Operator:</strong> Contains
                            </p>
                            <p>
                                <strong>Value:</strong> PO
                            </p>
                            <p className="text-gray-600 mt-1">
                                Result: Shows all orders with "PO" in order
                                number
                            </p>
                        </div>

                        <div className="p-3 bg-green-50 rounded border">
                            <h4 className="font-medium mb-2">
                                🔍 Advanced Filter Example:
                            </h4>
                            <p>
                                <strong>Group 1 (AND):</strong>
                            </p>
                            <p className="ml-4">• Order Number contains "PO"</p>
                            <p className="ml-4">• Status equals "pending"</p>
                            <p>
                                <strong>OR</strong>
                            </p>
                            <p>
                                <strong>Group 2 (AND):</strong>
                            </p>
                            <p className="ml-4">• Customer contains "PT"</p>
                            <p className="ml-4">
                                • Delivery Date after "2024-12-20"
                            </p>
                        </div>

                        <div className="p-3 bg-orange-50 rounded border">
                            <h4 className="font-medium mb-2">
                                🎯 Product-based Filter Example:
                            </h4>
                            <p>
                                <strong>Field:</strong> Product Name
                            </p>
                            <p>
                                <strong>Operator:</strong> Contains
                            </p>
                            <p>
                                <strong>Value:</strong> Product A
                            </p>
                            <p className="text-gray-600 mt-1">
                                Result: Shows orders containing "Product A" in
                                any product
                            </p>
                        </div>

                        <div className="p-3 bg-purple-50 rounded border">
                            <h4 className="font-medium mb-2">
                                📊 Quantity-based Filter Example:
                            </h4>
                            <p>
                                <strong>Field:</strong> Product Quantity (kg)
                            </p>
                            <p>
                                <strong>Operator:</strong> Greater Than
                            </p>
                            <p>
                                <strong>Value:</strong> 1500
                            </p>
                            <p className="text-gray-600 mt-1">
                                Result: Shows orders with any product over
                                1500kg
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
