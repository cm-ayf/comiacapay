export interface Thenable<T> {
  then(
    onFulfilled?: (value: T) => void,
    onRejected?: (reason: unknown) => void,
  ): void;
}

export function createThenable<Args extends unknown[], Ret>(
  init: (...args: Args) => Promise<Ret>,
  ...args: Args
): Thenable<Ret> {
  let promise: Promise<Ret>;

  return {
    then(onFulfilled, onRejected) {
      return (promise ??= init(...args)).then(onFulfilled, onRejected);
    },
  };
}
