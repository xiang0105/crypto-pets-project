import { computed, ref } from 'vue'
import type { PlayerProfile } from '@cryptopets/shared'
import { loginWithSignature, requestLoginNonce } from '@/api/auth'
import { clearAuthToken, getAuthToken } from '@/api/client'
import { getPlayer } from '@/api/game'
import { replaceGoodies } from '@/data/goodies'
import { replacePets } from '@/data/pets'
import { chainDataProvider } from '@/web3/chainData'

const FRONTEND_ONLY_AUTH = import.meta.env.VITE_FRONTEND_ONLY_AUTH !== 'false'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

const walletAddress = ref('')
const walletError = ref('')
const player = ref<PlayerProfile | null>(null)
const isAuthenticating = ref(false)
const isSyncingChainAssets = ref(false)

const shortWalletAddress = computed(() => {
  if (!walletAddress.value) {
    return ''
  }

  return `${walletAddress.value.slice(0, 6)}...${walletAddress.value.slice(-4)}`
})

async function connectWallet() {
  walletError.value = ''

  if (!window.ethereum) {
    walletError.value = 'MetaMask is not installed'
    throw new Error(walletError.value)
  }

  isAuthenticating.value = true

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
      throw new Error('No wallet account returned')
    }

    const wallet = accounts[0]
    walletAddress.value = wallet

    if (FRONTEND_ONLY_AUTH) {
      await syncChainAssets(wallet)
      return
    }

    const challenge = await requestLoginNonce(wallet)
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [challenge.message, wallet],
    })

    if (typeof signature !== 'string') {
      throw new Error('Wallet signature failed')
    }

    const session = await loginWithSignature({
      wallet,
      nonce: challenge.nonce,
      message: challenge.message,
      signature,
    })

    walletAddress.value = session.player.wallet
    player.value = session.player
    await syncChainAssets(session.player.wallet)
  } catch (error) {
    if (walletAddress.value) {
      await syncChainAssets(walletAddress.value)
    }
    clearAuthToken()
    walletError.value = error instanceof Error ? error.message : 'Wallet login failed'
    throw error
  } finally {
    isAuthenticating.value = false
  }
}

async function restoreSession() {
  if (FRONTEND_ONLY_AUTH) {
    return
  }

  if (!getAuthToken()) {
    return
  }

  try {
    player.value = await getPlayer()
    walletAddress.value = player.value.wallet
    await syncChainAssets(player.value.wallet)
  } catch {
    clearAuthToken()
  }
}

async function syncChainAssets(wallet: string) {
  isSyncingChainAssets.value = true
  walletError.value = ''

  try {
    const [walletPets, walletGoodies] = await Promise.all([
      chainDataProvider.getWalletPets(wallet),
      chainDataProvider.getWalletGoodies(wallet),
    ])

    replacePets(walletPets)
    replaceGoodies(walletGoodies)
  } catch (error) {
    replacePets([])
    replaceGoodies([])
    walletError.value = error instanceof Error ? error.message : 'Chain asset sync failed'
  } finally {
    isSyncingChainAssets.value = false
  }
}

export function useWallet() {
  return {
    walletAddress,
    walletError,
    player,
    isAuthenticating,
    isSyncingChainAssets,
    shortWalletAddress,
    connectWallet,
    restoreSession,
    syncChainAssets,
  }
}
