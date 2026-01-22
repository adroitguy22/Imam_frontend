import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../lib/error-handler';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
}

export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);

        if (options.successMessage) {
          showSuccess(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        const error = err instanceof Error ? err : new Error(errorMessage);
        setError(error);

        if (!options.onError) {
          showError(errorMessage);
        } else {
          options.onError(error);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, options, showSuccess, showError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}

export function useMutation<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const mutate = useCallback(
    async (...args: Args) => {
      setIsLoading(true);

      try {
        const result = await asyncFunction(...args);

        if (options.successMessage) {
          showSuccess(options.successMessage);
        }

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);

        if (!options.onError) {
          showError(errorMessage);
        } else {
          options.onError(err instanceof Error ? err : new Error(errorMessage));
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, options, showSuccess, showError]
  );

  return {
    mutate,
    isLoading,
  };
}
