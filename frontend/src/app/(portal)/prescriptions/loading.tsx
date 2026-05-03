import { PortalListSkeleton } from "@/features/portal/components/portal-skeletons";

export default function Loading() {
  return <PortalListSkeleton titleWidth="w-56" rows={4} sections={2} />;
}
