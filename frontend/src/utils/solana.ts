import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'

const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com'

export async function initializeSolana() {
  return new Connection(SOLANA_RPC_URL)
}

export async function convertUSDToToken(connection, usdAmount, tokenAddress) {
  // In a real-world scenario, you would fetch the current price from an oracle or API
  const mockPriceInUSD = tokenAddress === 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' ? 0.000001 : 0.1
  return (parseFloat(usdAmount) / mockPriceInUSD).toFixed(9)
}

export async function sendSolanaToken(connection, tokenAddress, amount, recipientAddress) {
  // This is a simplified example. In a real-world scenario, you would need to:
  // 1. Get the user's Solana wallet (e.g., using a wallet adapter)
  // 2. Create and sign the transaction properly
  // 3. Handle token accounts creation if they don't exist

  const senderKeypair = /* Get sender's keypair */
  const recipientPublicKey = new PublicKey(recipientAddress)
  const tokenPublicKey = new PublicKey(tokenAddress)

  const token = new Token(connection, tokenPublicKey, TOKEN_PROGRAM_ID, senderKeypair)
  const senderTokenAccount = await token.getOrCreateAssociatedAccountInfo(senderKeypair.publicKey)
  const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(recipientPublicKey)

  const transaction = new Transaction().add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      senderTokenAccount.address,
      recipientTokenAccount.address,
      senderKeypair.publicKey,
      [],
      amount * 1e9 // Assuming 9 decimal places for Solana tokens
    )
  )

  const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair])
  return signature
}