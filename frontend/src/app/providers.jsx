import { DataProvider } from '@/contexts/DataContext'
import { OperationModeProvider } from '@/contexts/OperationModeContext'
import { SimulationProvider } from '@/contexts/SimulationContext'
import { ToastProvider } from '@/contexts/ToastContext'

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <OperationModeProvider>
        <DataProvider>
          <SimulationProvider>{children}</SimulationProvider>
        </DataProvider>
      </OperationModeProvider>
    </ToastProvider>
  )
}
