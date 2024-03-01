// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = () => {};

export function makeDeferred<T>() {
  let resolve: (value: T) => void = empty;
  let reject: (error: unknown) => void = empty;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { resolve, reject, promise };
}
