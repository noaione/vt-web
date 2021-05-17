import React from "react";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

function SkeletonCard({ addViewers }: { addViewers?: boolean }) {
    return (
        <div className="flex flex-col bg-gray-900 col-span-1 rounded-lg">
            <div className="m-auto shadow-md rounded-lg w-full">
                <div className="relative items-start -mt-1">
                    <Skeleton height={404} />
                </div>
            </div>
            <div className="px-4 mt-4 text-gray-200 bg-gray-900">
                <Skeleton width={80} />
                <Skeleton height={30} />
            </div>
            <div className="px-4 mt-2 text-gray-200 bg-gray-900 flex flex-col">
                <Skeleton width={300} />
                <Skeleton width={280} />
                {addViewers && <Skeleton width={260} />}
            </div>
            <div className="rounded-b-lg px-4 py-4 mt-0 flex gap-2">
                <Skeleton width={90} height={40} />
                <Skeleton width={70} height={40} />
                <Skeleton width={140} height={40} />
            </div>
        </div>
    );
}

export default function VideosPagesSkeleton({ addViewers }: { addViewers?: boolean }) {
    return (
        <SkeletonTheme color="#404040" highlightColor="#525252">
            <div className="pb-3 mt-2 vtubers-group skeleton">
                <h2 className="text-white py-3 text-3xl font-bold mb-2">
                    <Skeleton width={120} height={40} />
                    <Skeleton width={40} height={40} className="ml-2" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-2">
                    <SkeletonCard addViewers={addViewers} />
                    <SkeletonCard addViewers={addViewers} />
                </div>
            </div>
        </SkeletonTheme>
    );
}
