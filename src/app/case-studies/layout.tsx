import { CaseStudyLock } from "@/components/CaseStudyLock";

/* Every case study route is gated behind the shared password lock. */
export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CaseStudyLock>{children}</CaseStudyLock>;
}
