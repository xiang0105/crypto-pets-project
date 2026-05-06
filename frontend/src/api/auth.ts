import type { AuthLoginResponse, AuthNonceResponse } from '@cryptopets/shared'
import { apiRequest, setAuthToken } from './client'

export async function requestLoginNonce(wallet: string) {
  return apiRequest<AuthNonceResponse>('/auth/nonce', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  })
}

export async function loginWithSignature(payload: {
  wallet: string
  nonce: string
  message: string
  signature: string
}) {
  const response = await apiRequest<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setAuthToken(response.token)
  return response
}
