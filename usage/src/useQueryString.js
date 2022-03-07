// https://medium.com/swlh/using-react-hooks-to-sync-your-component-state-with-the-url-query-string-81ccdfcb174f
import { useState, useCallback } from 'react';

const setQueryStringWithoutPageReload = (qsValue) => {
  const { protocol, host, pathname } = window.location;
  const newUrl = `${protocol}//${host}${pathname}${qsValue}`;

  window.history.pushState({ path: newUrl }, '', newUrl);
};

const setQueryStringValue = (
  key,
  value,
  queryString = window.location.search
) => {
  const qs = new URLSearchParams(queryString);
  qs.set(key, value);
  setQueryStringWithoutPageReload(`?${qs.toString()}`);
};

const getQueryStringValue = (key, queryString = window.location.search) =>
  new URLSearchParams(queryString).get(key);

const useQueryString = (key, initialValue) => {
  const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
  const onSetValue = useCallback(
    (newValue) => {
      setValue(newValue);
      setQueryStringValue(key, newValue);
    },
    [key]
  );

  return [value, onSetValue];
};

export default useQueryString;
