import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Wallet, JsonRpcProvider, formatEther } from 'https://esm.sh/ethers@6.15.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY')?.trim()
    const PRIVATE_KEY = Deno.env.get('PRIVATE_KEY')?.trim()

    const result: Record<string, unknown> = {
      checks: [],
      ready: false,
      requires_funding: false,
    }

    // Check secrets
    const secretsOk = Boolean(ALCHEMY_API_KEY) && Boolean(PRIVATE_KEY)
    result.checks = [
      { name: 'ALCHEMY_API_KEY present', ok: Boolean(ALCHEMY_API_KEY) },
      { name: 'PRIVATE_KEY present', ok: Boolean(PRIVATE_KEY) },
    ]

    if (!secretsOk) {
      return new Response(
        JSON.stringify({ ...result, message: 'Missing required secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Provider (Ethereum mainnet by default)
    const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    const provider = new JsonRpcProvider(rpcUrl)

    // Network and block
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()

    // Wallet basics
    const wallet = new Wallet(PRIVATE_KEY!, provider)
    const address = await wallet.getAddress()
    const balanceWei = await provider.getBalance(address)
    const balanceEth = formatEther(balanceWei)
    const nonce = await provider.getTransactionCount(address)

    // Fee data
    const feeData = await provider.getFeeData()

    // Gas estimation (no broadcast)
    let estimateOk = true
    let estimatedGas: string | null = null
    try {
      const gas = await provider.estimateGas({ from: address, to: address, value: 0n })
      estimatedGas = gas.toString()
    } catch (e) {
      estimateOk = false
      console.error('estimateGas failed', e)
    }

    // Determine readiness
    const minEthRequired = 0.005 // approx for simple tx; NFT minting likely higher
    const balNum = Number(balanceEth)
    const requiresFunding = isNaN(balNum) || balNum < minEthRequired

    result.checks = [
      ...result.checks as any[],
      { name: 'RPC reachable', ok: true, details: { chainId: Number(network.chainId), blockNumber } },
      { name: 'Wallet derived', ok: true, details: { address, nonce } },
      { name: 'Fee data available', ok: Boolean(feeData?.gasPrice || feeData?.maxFeePerGas) },
      { name: 'Gas estimation (dry-run)', ok: estimateOk, details: { estimatedGas } },
      { name: `Sufficient balance (>= ${minEthRequired} ETH)`, ok: !requiresFunding, details: { balanceEth } },
    ]

    const ready = secretsOk && estimateOk && !requiresFunding
    result.ready = ready
    result.requires_funding = requiresFunding

    return new Response(
      JSON.stringify({
        status: ready ? 'ok' : 'needs_attention',
        network: { chainId: Number(network.chainId), blockNumber },
        wallet: { address, balanceEth, nonce },
        feeData: {
          gasPrice: feeData.gasPrice?.toString() ?? null,
          maxFeePerGas: feeData.maxFeePerGas?.toString() ?? null,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() ?? null,
        },
        result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    console.error('blockchain-readiness-check error', e)
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})