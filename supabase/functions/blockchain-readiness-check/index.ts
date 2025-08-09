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

    // Attempt mainnet first, then gracefully fall back to Sepolia if mainnet is disabled in Alchemy
    const makeProvider = (net: 'mainnet' | 'sepolia') => new JsonRpcProvider(
      net === 'mainnet'
        ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    )

    const collect = async (provider: JsonRpcProvider) => {
      const network = await provider.getNetwork()
      const blockNumber = await provider.getBlockNumber()
      const wallet = new Wallet(PRIVATE_KEY!, provider)
      const address = await wallet.getAddress()
      const balanceWei = await provider.getBalance(address)
      const balanceEth = formatEther(balanceWei)
      const nonce = await provider.getTransactionCount(address)
      const feeData = await provider.getFeeData()
      let estimateOk = true
      let estimatedGas: string | null = null
      try {
        const gas = await provider.estimateGas({ from: address, to: address, value: 0n })
        estimatedGas = gas.toString()
      } catch (e) {
        estimateOk = false
        console.error('estimateGas failed', e)
      }
      return { network, blockNumber, wallet, address, balanceEth, nonce, feeData, estimateOk, estimatedGas }
    }

    let enableUrl: string | null = null
    let usedNetwork: 'mainnet' | 'sepolia' = 'mainnet'
    let data: any
    try {
      data = await collect(makeProvider('mainnet'))
    } catch (err: any) {
      const body: string | undefined = err?.info?.responseBody
      if (body && body.includes('enable the network')) {
        const m = body.match(/https:\/\/dashboard\.alchemy\.com\/apps\/[A-Za-z0-9_-]+\/networks/)
        enableUrl = m ? m[0] : null
      }
      // Fallback to Sepolia if mainnet blocked/disabled
      usedNetwork = 'sepolia'
      data = await collect(makeProvider('sepolia'))
    }

    // Determine readiness
    const minEthRequired = 0.005 // approx for simple tx; NFT minting likely higher
    const balNum = Number(data.balanceEth)
    const requiresFunding = isNaN(balNum) || balNum < minEthRequired

    result.checks = [
      ...result.checks as any[],
      { name: 'RPC reachable', ok: true, details: { chainId: Number(data.network.chainId), blockNumber: data.blockNumber, network: usedNetwork } },
      { name: 'Wallet derived', ok: true, details: { address: data.address, nonce: data.nonce } },
      { name: 'Fee data available', ok: Boolean(data.feeData?.gasPrice || data.feeData?.maxFeePerGas) },
      { name: 'Gas estimation (dry-run)', ok: data.estimateOk, details: { estimatedGas: data.estimatedGas } },
      { name: `Sufficient balance (>= ${minEthRequired} ETH)`, ok: !requiresFunding, details: { balanceEth: data.balanceEth } },
      ...(enableUrl ? [{ name: 'Mainnet enabled on Alchemy', ok: false, details: { enable_url: enableUrl } }] : []),
    ]

    const ready = data.estimateOk && !requiresFunding
    result.ready = ready
    result.requires_funding = requiresFunding

    return new Response(
      JSON.stringify({
        status: ready ? 'ok' : 'needs_attention',
        message: enableUrl ? 'Mainnet is disabled on your Alchemy app. Using Sepolia fallback.' : undefined,
        network: { chainId: Number(data.network.chainId), blockNumber: data.blockNumber, used: usedNetwork },
        wallet: { address: data.address, balanceEth: data.balanceEth, nonce: data.nonce },
        feeData: {
          gasPrice: data.feeData.gasPrice?.toString() ?? null,
          maxFeePerGas: data.feeData.maxFeePerGas?.toString() ?? null,
          maxPriorityFeePerGas: data.feeData.maxPriorityFeePerGas?.toString() ?? null,
        },
        result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    console.error('blockchain-readiness-check error', e)
    const body = e?.info?.responseBody
    let enableUrl: string | null = null
    if (body && typeof body === 'string' && body.includes('enable the network')) {
      const m = body.match(/https:\/\/dashboard\.alchemy\.com\/apps\/[A-Za-z0-9_-]+\/networks/)
      enableUrl = m ? m[0] : null
    }
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Internal error', enable_url: enableUrl }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})