import React from "react";
import { cn } from "@/shadcn/utils";

const Progress = ({
    className,
    value = 0,
    max = 100,
    size = "default",
    ...props
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
    };

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            <div
                className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export { Progress };
