import React, { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { Input } from "@/shadcn/ui/input";
import { Badge } from "@/shadcn/ui/badge";
import {
    Plus,
    X,
    Filter,
    RotateCcw,
    Calendar,
    Hash,
    Type,
    Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";

// Field definitions untuk orders
const filterFields = {
    order_number: {
        label: "Order Number",
        type: "string",
        icon: Hash,
        description: "PO number or order identifier",
    },
    customer: {
        label: "Customer",
        type: "string",
        icon: Type,
        description: "Customer name or company",
    },
    status: {
        label: "Status",
        type: "string",
        icon: Package,
        description: "Order status",
        options: ["pending", "confirmed", "processing", "shipped", "delivered"],
    },
    delivery_date: {
        label: "Delivery Date",
        type: "date",
        icon: Calendar,
        description: "Expected delivery date",
    },
    created_date: {
        label: "Created Date",
        type: "date",
        icon: Calendar,
        description: "Order creation date",
    },
    products_name: {
        label: "Product Name",
        type: "string",
        icon: Package,
        nested: "products.name",
        description: "Search within product names",
    },
    products_quantity_kg: {
        label: "Product Quantity (kg)",
        type: "number",
        icon: Hash,
        nested: "products.quantity_kg",
        description: "Product weight in kilograms",
    },
    products_quantity_unit: {
        label: "Product Quantity (unit)",
        type: "number",
        icon: Hash,
        nested: "products.quantity_unit",
        description: "Product quantity in units",
    },
};

// Operators berdasarkan type
const operatorsByType = {
    string: [
        { value: "equals", label: "Equals", symbol: "=" },
        { value: "not_equals", label: "Not Equals", symbol: "≠" },
        { value: "contains", label: "Contains", symbol: "⊃" },
        { value: "not_contains", label: "Not Contains", symbol: "⊅" },
        { value: "starts_with", label: "Starts With", symbol: "^" },
        { value: "ends_with", label: "Ends With", symbol: "$" },
        { value: "is_empty", label: "Is Empty", symbol: "∅" },
        { value: "is_not_empty", label: "Is Not Empty", symbol: "∄" },
    ],
    number: [
        { value: "equals", label: "Equals", symbol: "=" },
        { value: "not_equals", label: "Not Equals", symbol: "≠" },
        { value: "greater_than", label: "Greater Than", symbol: ">" },
        {
            value: "greater_than_equal",
            label: "Greater Than or Equal",
            symbol: "≥",
        },
        { value: "less_than", label: "Less Than", symbol: "<" },
        { value: "less_than_equal", label: "Less Than or Equal", symbol: "≤" },
    ],
    date: [
        { value: "equals", label: "Equals", symbol: "=" },
        { value: "not_equals", label: "Not Equals", symbol: "≠" },
        { value: "greater_than", label: "After", symbol: ">" },
        { value: "less_than", label: "Before", symbol: "<" },
        { value: "between", label: "Between", symbol: "⟷" },
    ],
};

// Helper function untuk get nested value
const getNestedValue = (obj, path) => {
    if (path.includes(".")) {
        const [arrayKey, property] = path.split(".");
        if (Array.isArray(obj[arrayKey])) {
            return obj[arrayKey].map((item) => item[property]);
        }
        return null;
    }
    return obj[path];
};

// Helper function untuk evaluate condition
const evaluateCondition = (item, condition) => {
    const { field, operator, value } = condition;
    const fieldConfig = filterFields[field];

    if (!fieldConfig || !value) return true;

    let itemValue;

    if (fieldConfig.nested) {
        itemValue = getNestedValue(item, fieldConfig.nested);
        // Untuk array values (products), check if any item matches
        if (Array.isArray(itemValue)) {
            return itemValue.some((val) =>
                evaluateValueCondition(val, operator, value, fieldConfig.type)
            );
        }
    } else {
        itemValue = item[field];
    }

    return evaluateValueCondition(itemValue, operator, value, fieldConfig.type);
};

// Helper function untuk evaluate single value condition
const evaluateValueCondition = (itemValue, operator, filterValue, type) => {
    if (itemValue === null || itemValue === undefined) {
        return operator === "is_empty";
    }

    const strItemValue = String(itemValue).toLowerCase();
    const strFilterValue = String(filterValue).toLowerCase();

    switch (operator) {
        case "equals":
            return type === "number"
                ? Number(itemValue) === Number(filterValue)
                : strItemValue === strFilterValue;
        case "not_equals":
            return type === "number"
                ? Number(itemValue) !== Number(filterValue)
                : strItemValue !== strFilterValue;
        case "contains":
            return strItemValue.includes(strFilterValue);
        case "not_contains":
            return !strItemValue.includes(strFilterValue);
        case "starts_with":
            return strItemValue.startsWith(strFilterValue);
        case "ends_with":
            return strItemValue.endsWith(strFilterValue);
        case "is_empty":
            return !itemValue || String(itemValue).trim() === "";
        case "is_not_empty":
            return itemValue && String(itemValue).trim() !== "";
        case "greater_than":
            return type === "number"
                ? Number(itemValue) > Number(filterValue)
                : new Date(itemValue) > new Date(filterValue);
        case "greater_than_equal":
            return type === "number"
                ? Number(itemValue) >= Number(filterValue)
                : new Date(itemValue) >= new Date(filterValue);
        case "less_than":
            return type === "number"
                ? Number(itemValue) < Number(filterValue)
                : new Date(itemValue) < new Date(filterValue);
        case "less_than_equal":
            return type === "number"
                ? Number(itemValue) <= Number(filterValue)
                : new Date(itemValue) <= new Date(filterValue);
        case "between":
            if (type === "date") {
                const [startDate, endDate] = filterValue.split(",");
                const itemDate = new Date(itemValue);
                return (
                    itemDate >= new Date(startDate) &&
                    itemDate <= new Date(endDate)
                );
            }
            return false;
        default:
            return true;
    }
};

// Helper function untuk evaluate filter group
const evaluateFilterGroup = (item, group) => {
    const { conditions, logic } = group;

    if (!conditions.length) return true;

    if (logic === "AND") {
        return conditions.every((condition) =>
            evaluateCondition(item, condition)
        );
    } else {
        return conditions.some((condition) =>
            evaluateCondition(item, condition)
        );
    }
};

// Main filter evaluation function
export const evaluateFilters = (items, filterGroups) => {
    if (!filterGroups.length) return items;

    return items.filter((item) => {
        // Evaluate all groups with OR logic between groups
        return filterGroups.some((group) => evaluateFilterGroup(item, group));
    });
};

// Generate unique IDs
const generateId = () =>
    `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// FilterCondition Component
const FilterCondition = ({ condition, groupId, onUpdate, onRemove }) => {
    const field = filterFields[condition.field];
    const operators = operatorsByType[field?.type] || [];
    const needsValue = !["is_empty", "is_not_empty"].includes(
        condition.operator
    );

    const handleFieldChange = (newField) => {
        const fieldConfig = filterFields[newField];
        const defaultOperator =
            operatorsByType[fieldConfig.type]?.[0]?.value || "equals";
        onUpdate(condition.id, {
            field: newField,
            operator: defaultOperator,
            value: "",
        });
    };

    const renderValueInput = () => {
        if (!needsValue) return null;

        const inputProps = {
            value: condition.value,
            onChange: (e) => onUpdate(condition.id, { value: e.target.value }),
            placeholder: `Enter ${field?.label.toLowerCase()}...`,
            className: "min-w-32",
        };

        switch (field?.type) {
            case "number":
                return <Input type="number" {...inputProps} />;
            case "date":
                if (condition.operator === "between") {
                    const [startDate, endDate] = (condition.value || ",").split(
                        ","
                    );
                    return (
                        <div className="flex space-x-1">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    const newValue = `${e.target.value},${endDate}`;
                                    onUpdate(condition.id, { value: newValue });
                                }}
                                className="min-w-32"
                            />
                            <span className="flex items-center px-2 text-gray-500">
                                to
                            </span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    const newValue = `${startDate},${e.target.value}`;
                                    onUpdate(condition.id, { value: newValue });
                                }}
                                className="min-w-32"
                            />
                        </div>
                    );
                }
                return <Input type="date" {...inputProps} />;
            default:
                if (field?.options) {
                    return (
                        <Select
                            value={condition.value}
                            onValueChange={(value) =>
                                onUpdate(condition.id, { value })
                            }
                        >
                            <SelectTrigger className="min-w-32">
                                <SelectValue placeholder="Select value..." />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                }
                return <Input {...inputProps} />;
        }
    };

    return (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
            {/* Field Selector */}
            <Select value={condition.field} onValueChange={handleFieldChange}>
                <SelectTrigger className="min-w-40">
                    <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(filterFields).map(([key, field]) => {
                        const Icon = field.icon;
                        return (
                            <SelectItem key={key} value={key}>
                                <div className="flex items-center space-x-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{field.label}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            {/* Operator Selector */}
            <Select
                value={condition.operator}
                onValueChange={(value) =>
                    onUpdate(condition.id, { operator: value, value: "" })
                }
            >
                <SelectTrigger className="min-w-36">
                    <SelectValue placeholder="Operator..." />
                </SelectTrigger>
                <SelectContent>
                    {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                            <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                                    {op.symbol}
                                </span>
                                <span>{op.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Value Input */}
            {renderValueInput()}

            {/* Remove Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(condition.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};

// FilterGroup Component
const FilterGroup = ({ group, onUpdate, onRemove, onAddCondition, isLast }) => {
    const handleLogicChange = (logic) => {
        onUpdate(group.id, { logic });
    };

    const handleConditionUpdate = (conditionId, updates) => {
        const updatedConditions = group.conditions.map((condition) =>
            condition.id === conditionId
                ? { ...condition, ...updates }
                : condition
        );
        onUpdate(group.id, { conditions: updatedConditions });
    };

    const handleConditionRemove = (conditionId) => {
        const updatedConditions = group.conditions.filter(
            (condition) => condition.id !== conditionId
        );
        if (updatedConditions.length === 0) {
            onRemove(group.id);
        } else {
            onUpdate(group.id, { conditions: updatedConditions });
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-mono">
                        Filter Group
                    </Badge>
                    <Select
                        value={group.logic}
                        onValueChange={handleLogicChange}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500">
                        {group.logic === "AND"
                            ? "All conditions must match"
                            : "Any condition can match"}
                    </span>
                </div>
                {group.conditions.length > 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(group.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X className="h-4 w-4" />
                        Remove Group
                    </Button>
                )}
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                {group.conditions.map((condition, index) => (
                    <div key={condition.id} className="space-y-2">
                        {index > 0 && (
                            <div className="flex items-center">
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-mono"
                                >
                                    {group.logic}
                                </Badge>
                            </div>
                        )}
                        <FilterCondition
                            condition={condition}
                            groupId={group.id}
                            onUpdate={handleConditionUpdate}
                            onRemove={handleConditionRemove}
                        />
                    </div>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddCondition(group.id)}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                </Button>
            </div>

            {!isLast && (
                <div className="flex justify-center">
                    <Badge
                        variant="default"
                        className="bg-orange-100 text-orange-800 font-mono"
                    >
                        OR
                    </Badge>
                </div>
            )}
        </div>
    );
};

// Main FilterBuilder Component
export default function FilterBuilder({ onFiltersChange, className = "" }) {
    const [filterGroups, setFilterGroups] = useState([]);

    const handleFiltersChange = (newFilterGroups) => {
        setFilterGroups(newFilterGroups);
        onFiltersChange(newFilterGroups);
    };

    const addFilterGroup = () => {
        const newGroup = {
            id: generateId(),
            logic: "AND",
            conditions: [
                {
                    id: generateId(),
                    field: "order_number",
                    operator: "contains",
                    value: "",
                },
            ],
        };
        handleFiltersChange([...filterGroups, newGroup]);
    };

    const updateFilterGroup = (groupId, updates) => {
        const updatedGroups = filterGroups.map((group) =>
            group.id === groupId ? { ...group, ...updates } : group
        );
        handleFiltersChange(updatedGroups);
    };

    const removeFilterGroup = (groupId) => {
        const updatedGroups = filterGroups.filter(
            (group) => group.id !== groupId
        );
        handleFiltersChange(updatedGroups);
    };

    const addCondition = (groupId) => {
        const newCondition = {
            id: generateId(),
            field: "order_number",
            operator: "contains",
            value: "",
        };

        const updatedGroups = filterGroups.map((group) =>
            group.id === groupId
                ? { ...group, conditions: [...group.conditions, newCondition] }
                : group
        );
        handleFiltersChange(updatedGroups);
    };

    const clearAllFilters = () => {
        handleFiltersChange([]);
    };

    const activeFiltersCount = filterGroups.reduce(
        (count, group) =>
            count + group.conditions.filter((c) => c.value).length,
        0
    );

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Advanced Search Filters</span>
                        {activeFiltersCount > 0 && (
                            <Badge variant="default">
                                {activeFiltersCount} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {filterGroups.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-red-600 hover:text-red-700"
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Clear All
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addFilterGroup}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Filter Group
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {filterGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm mb-3">No filters applied</p>
                        <Button variant="outline" onClick={addFilterGroup}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Your First Filter
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filterGroups.map((group, index) => (
                            <FilterGroup
                                key={group.id}
                                group={group}
                                onUpdate={updateFilterGroup}
                                onRemove={removeFilterGroup}
                                onAddCondition={addCondition}
                                isLast={index === filterGroups.length - 1}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
