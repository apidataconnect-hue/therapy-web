import api from './api'

export interface UploadedFile {
  id: string
}

export interface MultipleUploadResult {
  id: string
  key: string
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/multimedia', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function uploadMultipleFiles(files: Array<{ key: string; file: File }>): Promise<MultipleUploadResult[]> {
  const formData = new FormData()
  for (const { key, file } of files) {
    formData.append(key, file)
  }
  const { data } = await api.post('/multimedia/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
