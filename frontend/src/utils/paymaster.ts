import axios from 'axios'

const CIRCLE_PAYMASTER_API = 'https://api.circle.com/v1/w3s/paymaster'
const PAYMASTER_ADDRESS = '0x7ceA357B5AC0639F89F9e378a1f03Aa5005C0a25'

export async function sponsorTransaction(unsignedTx) {
  try {
    const response = await axios.post(CIRCLE_PAYMASTER_API, {
      chain: 'ethereum',
      transaction: unsignedTx,
      paymasterAddress: PAYMASTER_ADDRESS,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data.transaction
  } catch (error) {
    console.error('Error sponsoring transaction:', error)
    throw error
  }
}