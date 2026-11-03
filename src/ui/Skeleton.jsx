import React from "react";

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#192536] rounded-md ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-[#141E2D] border border-[#29374A] rounded-lg p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
    <Skeleton className="h-3 w-48" />
    <Skeleton className="h-3 w-36" />
    <div className="pt-3 border-t border-[#29374A] flex justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const ColumnSkeleton = () => (
  <div className="w-80 shrink-0 bg-[#141E2D] border border-[#29374A] rounded-lg p-3 space-y-3">
    <div className="flex items-center justify-between pb-2 border-b border-[#29374A]">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-6 rounded-full" />
    </div>
    <div className="space-y-2.5">
      <div className="bg-[#192536] border border-[#29374A] rounded-md p-3 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      <div className="bg-[#192536] border border-[#29374A] rounded-md p-3 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-2.5 w-5/6" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
