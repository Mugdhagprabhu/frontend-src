/** Clinical Cartography: data hooks make loading, retry, and unavailable-service states consistent across every operational module. */
import { useCallback, useEffect, useState } from "react";

export function useOperationData<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setData(await loader()); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load operational data."); } finally { setLoading(false); } }, dependencies);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, retry: load };
}
