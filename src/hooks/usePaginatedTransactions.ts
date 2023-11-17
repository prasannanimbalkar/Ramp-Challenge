import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const nextPage = paginatedTransactions === null ? 0 : paginatedTransactions.nextPage;
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: nextPage,
      }
    );
  
    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return null;
      }
      
      if (previousResponse === null) {
        return response;
      }
      
      return {
        ...response, // or {...previousResponse} depending on which has the properties you want to keep
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage
      };
    });
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
