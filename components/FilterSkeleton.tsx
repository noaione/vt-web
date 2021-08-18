import React from "react";

import Skeleton from "react-loading-skeleton";

const SkeletonCheckbox = {
    gap: "0.3rem",
};

export default function FilterSkeleton() {
    return (
        <div className="my-4">
            <label className="flex flex-col">
                <Skeleton width={33} />
                <div className="block w-full md:w-1/2 lg:w-1/3">
                    <Skeleton height={45} />
                </div>
            </label>
            <div className="mt-3">
                <Skeleton width={100} />
            </div>
            <div className="mt-1 flex flex-col sm:flex-row" style={{ gap: "0.75rem" }}>
                <div className="flex flex-row" style={SkeletonCheckbox}>
                    <Skeleton width={25} height={25} />
                    <Skeleton width={45} height={25} />
                </div>
                <div className="flex flex-row" style={SkeletonCheckbox}>
                    <Skeleton width={25} height={25} />
                    <Skeleton width={45} height={25} />
                </div>
                <div className="flex flex-row" style={SkeletonCheckbox}>
                    <Skeleton width={25} height={25} />
                    <Skeleton width={45} height={25} />
                </div>
                <div className="flex flex-row" style={SkeletonCheckbox}>
                    <Skeleton width={25} height={25} />
                    <Skeleton width={45} height={25} />
                </div>
                <div className="flex flex-row" style={SkeletonCheckbox}>
                    <Skeleton width={25} height={25} />
                    <Skeleton width={45} height={25} />
                </div>
            </div>
        </div>
    );
}
