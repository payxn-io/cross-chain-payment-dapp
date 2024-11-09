'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { initializeEthereum, sendPEPE } from '../utils/ethereum'
import { initializeSolana, sendSolanaToken, convertUSDToToken } from '../utils/solana'
import { sponsorTransaction } from '../utils/paymaster'

const TOKEN_OPTIONS = [
  { value: 'PEPE', label: '$PEPE (Ethereum)', address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', chain: 'ethereum' },
  { value: 'BONK', label: '$BONK (Solana)', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', chain: 'solana' },
  { value: 'WIF', label: '$WIF (Solana)', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', chain: 'solana' },
]

const USDC_SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export default function CrossChainPayment() {
  const [usdAmount, setUsdAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState(TOKEN_OPTIONS[0].value)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [status, setStatus] = useState('')

  const handleSendPayment = async () => {
    try {
      setStatus('Initiating transaction...')

      const selectedTokenInfo = TOKEN_OPTIONS.find(token => token.value === selectedToken)
      if (!selectedTokenInfo) {
        throw new Error('Invalid token selected')
      }

      let txHash

      if (selectedTokenInfo.chain === 'ethereum') {
        const ethereumProvider = await initializeEthereum()
        const tokenAmount = await convertUSDToToken(ethereumProvider, usdAmount, selectedTokenInfo.address)
        setStatus(`$${usdAmount} USD is equivalent to ${tokenAmount} ${selectedToken}`)

        const unsignedTx = await sendPEPE(ethereumProvider, tokenAmount, recipientAddress)
        const sponsoredTx = await sponsorTransaction(unsignedTx)
        const tx = await ethereumProvider.getSigner().sendTransaction(sponsoredTx)
        const receipt = await tx.wait()
        txHash = receipt.transactionHash
      } else {
        const solanaConnection = await initializeSolana()
        const tokenAmount = await convertUSDToToken(solanaConnection, usdAmount, selectedTokenInfo.address)
        setStatus(`$${usdAmount} USD is equivalent to ${tokenAmount} ${selectedToken}`)

        txHash = await sendSolanaToken(solanaConnection, selectedTokenInfo.address, tokenAmount, recipientAddress)
      }

      setStatus(`${selectedToken} sent. Transaction hash: ${txHash}`)

      // Wait for CCTP to process the transfer
      await new Promise(resolve => setTimeout(resolve, 10000))

      // Simulate receiving USDC on Solana
      setStatus(`$${usdAmount} USDC received on Solana address: ${recipientAddress}`)

    } catch (error) {
      console.error('Error:', error)
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Cross-Chain Payment</CardTitle>
        <CardDescription>Send tokens, receive USDC on Solana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Input
              id="amount"
              placeholder="Amount in USD"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {TOKEN_OPTIONS.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    {token.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Input
              id="recipient"
              placeholder="Solana recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <Button onClick={handleSendPayment}>Send Payment</Button>
        {status && <p className="mt-2 text-sm text-gray-500">{status}</p>}
      </CardFooter>
    </Card>
  )
}