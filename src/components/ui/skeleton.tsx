'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    children?: React.ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
    return (
        <div className={`skeleton-shimmer rounded-lg ${className}`}>
            {children}
        </div>
    );
}

export function SkeletonText({ className = '', lines = 1 }: { className?: string; lines?: number }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-4 skeleton-shimmer rounded-md ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
    };
    return <div className={`${sizeClasses[size]} rounded-full skeleton-shimmer`} />;
}

export function SkeletonCard({ hasImage = true }: { hasImage?: boolean }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {hasImage && <div className="h-48 skeleton-shimmer" />}
            <div className="p-6 space-y-4">
                <div className="h-5 skeleton-shimmer rounded-md w-3/4" />
                <div className="h-4 skeleton-shimmer rounded-md w-1/2" />
                <div className="space-y-2">
                    <div className="h-3 skeleton-shimmer rounded-md" />
                    <div className="h-3 skeleton-shimmer rounded-md w-5/6" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <div className="h-4 w-4 skeleton-shimmer rounded" />
                    <div className="h-3 skeleton-shimmer rounded-md w-16" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex space-x-8">
                    {Array.from({ length: cols }).map((_, i) => (
                        <div key={i} className="h-4 skeleton-shimmer rounded-md w-24" />
                    ))}
                </div>
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, row) => (
                <div key={row} className="px-6 py-4 border-b border-gray-100 flex space-x-8 items-center">
                    {Array.from({ length: cols }).map((_, col) => (
                        <div
                            key={col}
                            className={`h-4 skeleton-shimmer rounded-md ${col === 0 ? 'w-32' : 'w-20'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonStat() {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <div className="h-3 skeleton-shimmer rounded-md w-20" />
                    <div className="h-8 skeleton-shimmer rounded-md w-16" />
                    <div className="h-3 skeleton-shimmer rounded-md w-14" />
                </div>
                <div className="w-12 h-12 skeleton-shimmer rounded-lg" />
            </div>
        </div>
    );
}
