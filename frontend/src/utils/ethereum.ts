import { ethers } from 'ethers'

const PEPE_CONTRACT_ADDRESS = '0x6982508145454ce325ddbe47a25d4ec3d2311933'
const CCTP_CONTRACT_ADDRESS = '0x...' // Replace with actual CCTP contract address

const PEPE_ABI = [
  // Add PEPE token ABI here
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transfer(address recipient, uint256 amount) public returns (bool)"
]

const CCTP_ABI = [
  // Add CCTP contract ABI here
  "function initiateTransfer(address token, uint256 amount, string memory toChain, string memory toAddress) external"
]

export async function initializeEthereum() {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    return new ethers.providers.Web3Provider(window.ethereum)
  } else {
    throw new Error('Ethereum wallet not found')
  }
}

export async function convertUSDToToken(provider, usdAmount, tokenAddress) {
  // In a real-world scenario, you would fetch the current price from an oracle or API
  const mockPriceInUSD = 0.000001 // Example price: 1 PEPE = $0.000001
  return ethers.utils.parseUnits((parseFloat(usdAmount) / mockPriceInUSD).toFixed(18), 18)
}

export async function sendPEPE(provider, amount, recipientAddress) {
  const signer = provider.getSigner()
  const pepeContract = new ethers.Contract(PEPE_CONTRACT_ADDRESS, PEPE_ABI, signer)
  const cctpContract = new ethers.Contract(CCTP_CONTRACT_ADDRESS, CCTP_ABI, signer)

  // Prepare approval transaction
  const approveTx = await pepeContract.populateTransaction.approve(CCTP_CONTRACT_ADDRESS, amount)

  // Prepare transfer transaction
  const transferTx = await cctpContract.populateTransaction.initiateTransfer(
    PEPE_CONTRACT_ADDRESS,
    amount,
    'solana',
    recipientAddress
  )

  // Combine transactions
  const unsignedTx = {
    to: PEPE_CONTRACT_ADDRESS,
    data: approveTx.data,
    gasLimit: ethers.utils.hexlify(100000), // Estimate gas limit
    value: '0x00',
  }

  return unsignedTx
}