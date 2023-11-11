import dynamic from "next/dynamic";
import { Suspense, type SuspenseProps } from "react";

function _Suspense({ children, fallback }: SuspenseProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

const NoSSRSuspense = dynamic(async () => _Suspense, { ssr: false });
export default NoSSRSuspense;
