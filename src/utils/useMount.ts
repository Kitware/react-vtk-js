import { EffectCallback, useEffect } from 'react';

export default function useMount(cb: EffectCallback) {
  useEffect(() => {
    cb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
