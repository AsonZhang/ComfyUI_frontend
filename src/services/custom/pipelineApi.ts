/**
 * Custom Pipeline API Service
 * Communicates with the internal service through ComfyUI backend proxy.
 */

import { api } from '@/scripts/api'

const CUSTOM_API_PREFIX = '/api/custom'

export interface PipelineExecution {
  id: string
  status: 'pending' | 'running' | 'success' | 'error' | 'cancelled'
  progress?: number
  promptName?: string
  createTime: number
  startTime?: number
  completionTime?: number
  error?: string
}

export interface TaskQueueItem {
  jobId: string
  status: string
  progress?: number
  promptName?: string
  createTime: number
}

export interface PipelineSaveRequest {
  id?: string
  name: string
  workflow: object
  description?: string
}

export interface PipelineExecuteRequest {
  workflow: object
  extra_data?: object
}

/**
 * Execute a pipeline workflow
 */
export async function executePipeline(
  workflow: object,
  extraData?: object
): Promise<{ executionId: string; status: string }> {
  const response = await api.fetchApi(`${CUSTOM_API_PREFIX}/pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow,
      extra_data: extraData
    })
  })
  
  if (!response.ok) {
    throw new Error(`Execute pipeline failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get list of pipeline executions
 */
export async function getExecutionList(params?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<{ executions: PipelineExecution[]; total: number }> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  
  const response = await api.fetchApi(
    `${CUSTOM_API_PREFIX}/pipeline/executions?${query.toString()}`
  )
  
  if (!response.ok) {
    throw new Error(`Get execution list failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get execution detail
 */
export async function getExecutionDetail(executionId: string): Promise<PipelineExecution> {
  const response = await api.fetchApi(
    `${CUSTOM_API_PREFIX}/pipeline/executions/${executionId}`
  )
  
  if (!response.ok) {
    throw new Error(`Get execution detail failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Cancel an execution
 */
export async function cancelExecution(executionId: string): Promise<{ success: boolean }> {
  const response = await api.fetchApi(
    `${CUSTOM_API_PREFIX}/pipeline/executions/${executionId}/cancel`,
    { method: 'POST' }
  )
  
  if (!response.ok) {
    throw new Error(`Cancel execution failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get execution status
 */
export async function getExecutionStatus(executionId: string): Promise<{
  status: string
  progress: number
  currentNode?: string
}> {
  const response = await api.fetchApi(
    `${CUSTOM_API_PREFIX}/pipeline/executions/${executionId}/status`
  )
  
  if (!response.ok) {
    throw new Error(`Get execution status failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Save a pipeline (create or update)
 */
export async function savePipeline(data: PipelineSaveRequest): Promise<{
  id: string
  name: string
  savedAt: number
}> {
  const response = await api.fetchApi(`${CUSTOM_API_PREFIX}/pipeline/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`Save pipeline failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get pipeline detail
 */
export async function getPipelineDetail(pipelineId: string): Promise<{
  id: string
  name: string
  workflow: object
  description?: string
  createdAt: number
  updatedAt: number
}> {
  const response = await api.fetchApi(
    `${CUSTOM_API_PREFIX}/pipeline/${pipelineId}`
  )
  
  if (!response.ok) {
    throw new Error(`Get pipeline detail failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get task queue list
 */
export async function getTaskQueue(): Promise<{
  running: TaskQueueItem[]
  pending: TaskQueueItem[]
  history: TaskQueueItem[]
}> {
  const response = await api.fetchApi(`${CUSTOM_API_PREFIX}/task_queue`)
  
  if (!response.ok) {
    throw new Error(`Get task queue failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Export all functions as a service object
export const pipelineApi = {
  executePipeline,
  getExecutionList,
  getExecutionDetail,
  cancelExecution,
  getExecutionStatus,
  savePipeline,
  getPipelineDetail,
  getTaskQueue
}