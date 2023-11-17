import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isFilteredByEmployee, setIsFilteredByEmployee] = useState(false);


  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadTransactionsByEmployee = useCallback(
  async (employeeId: string) => {
    setIsFilteredByEmployee(true);
    paginatedTransactionsUtils.invalidateData();
    await transactionsByEmployeeUtils.fetchById(employeeId);
  },
  [paginatedTransactionsUtils, transactionsByEmployeeUtils]
);

const loadAllTransactions = useCallback(async () => {
  setIsFilteredByEmployee(false);
  setIsLoading(true);
  transactionsByEmployeeUtils.invalidateData();
  await employeeUtils.fetchAll();
  await paginatedTransactionsUtils.fetchAll();
  setIsLoading(false);
}, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils]);


  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])
  
  // Effect for loading employees only once when the component mounts or when explicitly needed
  useEffect(() => {
    const initEmployees = async () => {
      setLoadingEmployees(true);
      await employeeUtils.fetchAll();
      setLoadingEmployees(false);
    };

    if (employees === null && !employeeUtils.loading) {
      initEmployees();
    }
  }, [employeeUtils, employees]);

  const canLoadMore = paginatedTransactions && paginatedTransactions.nextPage !== null;


  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={loadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === EMPTY_EMPLOYEE || newValue === null) {
              await loadAllTransactions();
            } else {
              await loadTransactionsByEmployee(newValue.id); // Make sure this is the correct reference to ID depending on what your EMPTY_EMPLOYEE looks like
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {
            transactions !== null && !isFilteredByEmployee &&  canLoadMore && (
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                onClick={async () => {
                  await paginatedTransactionsUtils.fetchAll(); // Fetch next page of transactions
                }}
              >
                View More
              </button>
            )
          }
        </div>
      </main>
    </Fragment>
  )
}
