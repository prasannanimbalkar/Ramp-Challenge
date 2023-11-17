import { useCallback, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  type ApprovalStates = {
    [key: string]: boolean;
  };

  const [approvalStates, setApprovalStates] = useState<ApprovalStates>(
    transactions ? transactions.reduce((acc, t) => ({ ...acc, [t.id]: t.approved }), {}) : {}
  );
  
  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
      setApprovalStates(current => ({ ...current, [transactionId]: newValue }));

    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          approved={approvalStates[transaction.id]}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
