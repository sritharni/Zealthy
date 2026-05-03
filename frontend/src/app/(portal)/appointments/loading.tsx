import { PortalListSkeleton } from "@/features/portal/components/portal-skeletons";

export default function Loading() {
  return <PortalListSkeleton titleWidth="w-52" rows={4} sections={2} />;
}
