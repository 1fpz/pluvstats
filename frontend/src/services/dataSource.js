import { demoRepository } from './demoRepository'

/**
 * Single access point for local demonstration data.
 * In the backend phase this module will probe the API and return the matching
 * repository while preserving the exact same interface for the UI.
 */
export const dataSource = demoRepository

export const dataSourceInfo = {
  kind: 'demo',
  label: 'Demonstração local',
  description: 'Dados gerados no navegador pelo runtime de demonstração. Nenhum hardware está conectado.',
}

export async function initializeDataSource() {
  dataSource.init()
  return dataSource.getSnapshot()
}
