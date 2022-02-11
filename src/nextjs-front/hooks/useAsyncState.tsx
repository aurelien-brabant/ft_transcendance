import { useState, useRef, useCallback, useEffect } from "react";

function useAsyncState<T>(initialState: T): [T, (newState: T) => Promise<T>] {
  const [state, setState] = useState(initialState);
  const resolveState = useRef<((value: T) => void) | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (resolveState.current) {
      resolveState.current(state);
    }
  }, [state]);

  const setAsyncState: (newState: T) => Promise<T> = useCallback(
    newState =>
      new Promise<T>(resolve => {
        if (isMounted.current) {
          resolveState.current = resolve;
          setState(newState);
        }
      }),
    []
  );

  return [state, setAsyncState];
}

export default useAsyncState;
