import { useState } from "react";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    MoreHorizontal,
    Menu,
    Shield,
    ExternalLink,
    FolderPlus,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import MenuItemEditor from "./MenuItemEditor";

export default function NavigationEditor({ menuItems, permissions, onChange }) {
    const [editingItem, setEditingItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    const handleAddItem = (parentIndex = null) => {
        const newItem = {
            title: "New Menu Item",
            href: "#",
            icon: "menu",
            label: "New Menu Item",
            permit: null,
            children: [],
        };

        setEditingItem({ item: newItem, parentIndex, isNew: true });
        setIsDialogOpen(true);
    };

    const handleEditItem = (item, parentIndex = null, childIndex = null) => {
        setEditingItem({ item, parentIndex, childIndex, isNew: false });
        setIsDialogOpen(true);
    };

    const handleDeleteItem = (parentIndex, childIndex = null) => {
        const newItems = [...menuItems];
        if (childIndex !== null) {
            newItems[parentIndex].children.splice(childIndex, 1);
        } else {
            newItems.splice(parentIndex, 1);
        }
        onChange(newItems);
    };

    const handleMoveUp = (parentIndex, childIndex = null) => {
        const newItems = [...menuItems];

        if (childIndex !== null) {
            // Moving child item up within parent
            if (childIndex > 0) {
                const parentItem = newItems[parentIndex];
                const children = [...parentItem.children];
                const item = children[childIndex];
                children.splice(childIndex, 1);
                children.splice(childIndex - 1, 0, item);
                newItems[parentIndex].children = children;
                onChange(newItems);
            }
        }
        // Note: Removed parent item move up functionality
    };

    const handleMoveDown = (parentIndex, childIndex = null) => {
        const newItems = [...menuItems];

        if (childIndex !== null) {
            // Moving child item down within parent
            const parentItem = newItems[parentIndex];
            if (childIndex < parentItem.children.length - 1) {
                const children = [...parentItem.children];
                const item = children[childIndex];
                children.splice(childIndex, 1);
                children.splice(childIndex + 1, 0, item);
                newItems[parentIndex].children = children;
                onChange(newItems);
            }
        }
        // Note: Removed parent item move down functionality
    };

    const handleSaveItem = (savedItem) => {
        const newItems = [...menuItems];

        if (editingItem.isNew) {
            if (editingItem.parentIndex !== null) {
                // Add as child
                if (!newItems[editingItem.parentIndex].children) {
                    newItems[editingItem.parentIndex].children = [];
                }
                newItems[editingItem.parentIndex].children.push(savedItem);
            } else {
                // Add as root item
                newItems.push(savedItem);
            }
        } else {
            // Update existing item
            if (editingItem.childIndex !== null) {
                newItems[editingItem.parentIndex].children[
                    editingItem.childIndex
                ] = savedItem;
            } else if (editingItem.parentIndex !== null) {
                newItems[editingItem.parentIndex] = savedItem;
            }
        }

        onChange(newItems);
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDragStart = (e, item, parentIndex, childIndex = null) => {
        setDraggedItem({ item, parentIndex, childIndex });
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.outerHTML);

        // Add dragging styles
        setTimeout(() => {
            e.target.style.opacity = "0.5";
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = "1";
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e, parentIndex, childIndex = null) => {
        e.preventDefault();
        setDragOverItem({ parentIndex, childIndex });
    };

    const handleDragLeave = (e) => {
        // Only clear drag over if we're really leaving the drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverItem(null);
        }
    };

    const handleDrop = (e, targetParentIndex, targetChildIndex = null) => {
        e.preventDefault();

        if (!draggedItem) return;

        // Prevent dropping item on itself
        if (
            draggedItem.parentIndex === targetParentIndex &&
            draggedItem.childIndex === targetChildIndex
        ) {
            return;
        }

        const isDraggingParent = draggedItem.childIndex === null;
        const isDraggingChild = draggedItem.childIndex !== null;

        // RULE 1 & 2: Parent items can only reorder as parents (cannot become children)
        if (isDraggingParent && targetChildIndex !== null) {
            return; // Invalid operation
        }

        // RULE 3 & 4: Child items can only reorder within the same parent
        if (isDraggingChild && draggedItem.parentIndex !== targetParentIndex) {
            return; // Invalid operation
        }

        if (isDraggingChild && targetChildIndex === null) {
            return; // Invalid operation
        }

        let newItems = [...menuItems];
        const itemToMove = draggedItem.item;

        if (isDraggingParent) {
            // PARENT REORDERING: Simple parent-to-parent reordering
            newItems.splice(draggedItem.parentIndex, 1);

            // Adjust target index if we removed an item before the target
            let adjustedTargetIndex = targetParentIndex;
            if (draggedItem.parentIndex < targetParentIndex) {
                adjustedTargetIndex--;
            }

            newItems.splice(adjustedTargetIndex, 0, itemToMove);
        } else {
            // CHILD REORDERING: Simple child reordering within same parent
            const parentItem = newItems[draggedItem.parentIndex];
            if (parentItem && parentItem.children) {
                // Remove from old position
                parentItem.children.splice(draggedItem.childIndex, 1);

                // Adjust target index if we removed an item before the target
                let adjustedTargetIndex = targetChildIndex;
                if (draggedItem.childIndex < targetChildIndex) {
                    adjustedTargetIndex--;
                }

                // Insert at new position
                parentItem.children.splice(adjustedTargetIndex, 0, itemToMove);
            }
        }

        onChange(newItems);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const renderMenuItem = (item, parentIndex, childIndex = null) => {
        const isChild = childIndex !== null;
        const requiredPermissions = item.permit
            ? item.permit.split("|").map((p) => p.trim())
            : [];

        const isDraggedOver =
            dragOverItem &&
            dragOverItem.parentIndex === parentIndex &&
            dragOverItem.childIndex === childIndex;

        const isDragging =
            draggedItem &&
            draggedItem.parentIndex === parentIndex &&
            draggedItem.childIndex === childIndex;

        // Check if this is a valid drop zone based on current drag operation
        const isValidDropZone = draggedItem
            ? (() => {
                  const isDraggingParent = draggedItem.childIndex === null;
                  const isDraggingChild = draggedItem.childIndex !== null;

                  // Parent items can only drop on parent positions
                  if (isDraggingParent && isChild) return false;

                  // Child items can only drop within same parent
                  if (
                      isDraggingChild &&
                      (!isChild || draggedItem.parentIndex !== parentIndex)
                  )
                      return false;

                  return true;
              })()
            : true;

        // Check if child item can move up/down (only for child items)
        const canMoveUp = isChild ? childIndex > 0 : false;
        const canMoveDown = isChild
            ? childIndex < menuItems[parentIndex].children.length - 1
            : false;

        return (
            <div
                key={`${item.title}-${parentIndex}-${childIndex}`}
                className={`
                    relative border rounded-lg p-4 bg-background transition-all duration-200
                    ${isChild ? "ml-6" : ""}
                    ${
                        isDraggedOver && isValidDropZone
                            ? "border-primary bg-primary/5 scale-105"
                            : ""
                    }
                    ${isDragging ? "opacity-50 scale-95" : ""}
                    ${
                        draggedItem && !isValidDropZone && !isDragging
                            ? "opacity-50 border-dashed border-muted-foreground cursor-not-allowed"
                            : ""
                    }
                `}
                draggable={!isChild} // Only parent items are draggable
                onDragStart={
                    !isChild
                        ? (e) =>
                              handleDragStart(e, item, parentIndex, childIndex)
                        : undefined
                }
                onDragEnd={!isChild ? handleDragEnd : undefined}
                onDragOver={!isChild ? handleDragOver : undefined}
                onDragEnter={
                    !isChild
                        ? (e) => {
                              // Only allow valid drop operations based on rules
                              const isDraggingParent =
                                  draggedItem?.childIndex === null;
                              const isDraggingChild =
                                  draggedItem?.childIndex !== null;

                              // RULE 1 & 2: Parent items cannot become children
                              if (isDraggingParent && isChild) {
                                  return; // Don't highlight invalid drop zones
                              }

                              // RULE 3 & 4: Child items can only move within same parent
                              if (
                                  isDraggingChild &&
                                  (!isChild ||
                                      draggedItem.parentIndex !== parentIndex)
                              ) {
                                  return; // Don't highlight invalid drop zones
                              }

                              handleDragEnter(e, parentIndex, childIndex);
                          }
                        : undefined
                }
                onDragLeave={!isChild ? handleDragLeave : undefined}
                onDrop={
                    !isChild
                        ? (e) => handleDrop(e, parentIndex, childIndex)
                        : undefined
                }
            >
                {/* Drop indicator for visual feedback */}
                {isDraggedOver && (
                    <div className="absolute inset-0 border-2 border-primary border-dashed rounded-lg pointer-events-none" />
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* For Child Items: Show Up/Down buttons at front */}
                        {isChild ? (
                            <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 w-7 p-0 rounded-none border-r transition-all duration-200 ${
                                        !canMoveUp
                                            ? "opacity-30 cursor-not-allowed"
                                            : "hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95"
                                    }`}
                                    onClick={() =>
                                        handleMoveUp(parentIndex, childIndex)
                                    }
                                    disabled={!canMoveUp}
                                    title="Pindah ke atas"
                                >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 w-7 p-0 rounded-none transition-all duration-200 ${
                                        !canMoveDown
                                            ? "opacity-30 cursor-not-allowed"
                                            : "hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95"
                                    }`}
                                    onClick={() =>
                                        handleMoveDown(parentIndex, childIndex)
                                    }
                                    disabled={!canMoveDown}
                                    title="Pindah ke bawah"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            /* For Parent Items: Only show drag handle and menu icon */
                            <GripVertical
                                className={`h-4 w-4 cursor-move transition-colors ${
                                    isDragging
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            />
                        )}
                        <Menu className="h-4 w-4" />

                        <div>
                            <div className="font-medium">{item.title}</div>
                            {item.href && item.href !== "#" && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <ExternalLink className="h-3 w-3" />
                                    <code className="text-xs">{item.href}</code>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Permission badges */}
                        {requiredPermissions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {requiredPermissions
                                    .slice(0, 2)
                                    .map((perm, index) => {
                                        const permission = permissions.find(
                                            (p) => p.name === perm
                                        );
                                        return (
                                            <Badge
                                                key={`badge-${parentIndex}-${childIndex}-${index}`}
                                                variant={
                                                    permission
                                                        ? "outline"
                                                        : "destructive"
                                                }
                                                className="text-xs"
                                            >
                                                <Shield className="h-3 w-3 mr-1" />
                                                {permission
                                                    ? permission.display_name ||
                                                      perm
                                                    : `${perm} (missing)`}
                                            </Badge>
                                        );
                                    })}
                                {requiredPermissions.length > 2 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        +{requiredPermissions.length - 2} more
                                    </Badge>
                                )}
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleEditItem(
                                            item,
                                            parentIndex,
                                            childIndex
                                        )
                                    }
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>

                                {!isChild && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleAddItem(parentIndex)
                                        }
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Child
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleDeleteItem(
                                            parentIndex,
                                            childIndex
                                        )
                                    }
                                    className="gap-2 text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Child items */}
                {!isChild && item.children && item.children.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {item.children.map((child, childIdx) => (
                            <div
                                key={`child-wrapper-${parentIndex}-${childIdx}`}
                            >
                                {/* Drop zone before child item - RULE 3: Only show for child items within same parent */}
                                {draggedItem &&
                                    draggedItem.childIndex !== null &&
                                    draggedItem.parentIndex === parentIndex &&
                                    draggedItem.childIndex !== childIdx && (
                                        <div
                                            className={`
                                            h-2 transition-all duration-200
                                            ${
                                                dragOverItem &&
                                                dragOverItem.parentIndex ===
                                                    parentIndex &&
                                                dragOverItem.childIndex ===
                                                    childIdx
                                                    ? "border-t-2 border-primary bg-primary/10"
                                                    : "hover:border-t border-muted-foreground/30"
                                            }
                                        `}
                                            onDragOver={handleDragOver}
                                            onDragEnter={(e) =>
                                                handleDragEnter(
                                                    e,
                                                    parentIndex,
                                                    childIdx
                                                )
                                            }
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    parentIndex,
                                                    childIdx
                                                )
                                            }
                                        />
                                    )}
                                {renderMenuItem(child, parentIndex, childIdx)}
                                {/* Drop zone after last child item - RULE 3: Only show for child items within same parent */}
                                {draggedItem &&
                                    draggedItem.childIndex !== null &&
                                    draggedItem.parentIndex === parentIndex &&
                                    childIdx === item.children.length - 1 && (
                                        <div
                                            className={`
                                            h-2 transition-all duration-200
                                            ${
                                                dragOverItem &&
                                                dragOverItem.parentIndex ===
                                                    parentIndex &&
                                                dragOverItem.childIndex ===
                                                    childIdx + 1
                                                    ? "border-t-2 border-primary bg-primary/10"
                                                    : "hover:border-t border-muted-foreground/30"
                                            }
                                        `}
                                            onDragOver={handleDragOver}
                                            onDragEnter={(e) =>
                                                handleDragEnter(
                                                    e,
                                                    parentIndex,
                                                    childIdx + 1
                                                )
                                            }
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    parentIndex,
                                                    childIdx + 1
                                                )
                                            }
                                        />
                                    )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Navigation Structure Editor</CardTitle>
                        <CardDescription>
                            Menu utama dapat di-drag & drop untuk reorder. Sub
                            menu menggunakan button ⬆️⬇️ untuk reorder dalam
                            parent yang sama. Click ⋯ untuk edit, add child,
                            atau delete.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleAddItem()}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Menu Item
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {menuItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Menu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>
                                No menu items yet. Click "Add Menu Item" to get
                                started.
                            </p>
                        </div>
                    ) : (
                        <>
                            {menuItems.map((item, index) =>
                                renderMenuItem(item, index)
                            )}

                            {/* Drop zone at the end - RULE 1: Only show for parent items */}
                            {draggedItem && draggedItem.childIndex === null && (
                                <div
                                    className={`
                                        border-2 border-dashed border-muted-foreground/30 rounded-lg p-4
                                        transition-all duration-200 text-center text-muted-foreground
                                        ${
                                            dragOverItem &&
                                            dragOverItem.parentIndex ===
                                                menuItems.length
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "hover:border-muted-foreground/50"
                                        }
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragEnter={(e) =>
                                        handleDragEnter(
                                            e,
                                            menuItems.length,
                                            null
                                        )
                                    }
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) =>
                                        handleDrop(e, menuItems.length, null)
                                    }
                                >
                                    Drop here to reorder menu position
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Editor Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem?.isNew
                                    ? "Add New Menu Item"
                                    : "Edit Menu Item"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure menu item properties, permissions, dan
                                routing.
                            </DialogDescription>
                        </DialogHeader>
                        {editingItem && (
                            <MenuItemEditor
                                item={editingItem.item}
                                permissions={permissions}
                                onSave={handleSaveItem}
                                onCancel={() => {
                                    setIsDialogOpen(false);
                                    setEditingItem(null);
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
