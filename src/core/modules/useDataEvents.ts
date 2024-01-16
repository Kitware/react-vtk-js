import { useEffect, useRef } from 'react';
import { createEvent } from '../../utils/createEvent';

interface UseDataEventsProps<T> {
  onDataAvailable?: (obj?: T) => void;
  onDataChanged?: (obj?: T) => void;
}

export default function useDataEvents<T>(props: UseDataEventsProps<T>) {
  const dataChangedEvent = useRef(createEvent<T>());
  const dataAvailableEvent = useRef(createEvent<T>());

  const { onDataAvailable } = props;
  useEffect(() => {
    if (!onDataAvailable) return;
    return dataAvailableEvent.current.addEventListener(onDataAvailable);
  }, [onDataAvailable, dataAvailableEvent]);

  const { onDataChanged } = props;
  useEffect(() => {
    if (!onDataChanged) return;
    return dataChangedEvent.current.addEventListener(onDataChanged);
  }, [onDataChanged, dataChangedEvent]);

  return { dataChangedEvent, dataAvailableEvent };
}
