import { DashboardPageSkeleton } from '@/components/dashboard/skeletons';

export default function BookingsLoading() {
    return <DashboardPageSkeleton withTabs withStats={false} rows={6} />;
}
