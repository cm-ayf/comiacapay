import { use } from "react";
import type { FC, JSX } from "react";

export function dynamic<Props>(
  loader: () => Promise<{ default: FC<Props & JSX.IntrinsicAttributes> }>,
) {
  let promise: Promise<{ default: FC<Props & JSX.IntrinsicAttributes> }>;
  return function DynamicComponent(props: Props & JSX.IntrinsicAttributes) {
    const { default: LoadedComponent } = use((promise ??= loader()));
    return <LoadedComponent {...props} />;
  };
}
