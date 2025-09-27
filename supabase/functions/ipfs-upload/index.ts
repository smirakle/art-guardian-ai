import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[IPFS-UPLOAD] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("IPFS upload function started");

    const pinataApiKey = Deno.env.get("PINATA_API_KEY");
    const pinataSecretKey = Deno.env.get("PINATA_SECRET_KEY");
    
    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error("Pinata credentials not configured");
    }
    
    logStep("Pinata credentials verified");

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      // Handle metadata upload
      const { metadata, type } = await req.json();
      logStep("Processing metadata upload", { type });
      
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "pinata_api_key": pinataApiKey,
          "pinata_secret_api_key": pinataSecretKey,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name || 'metadata'} - ${type}`,
            keyvalues: {
              service: "TSMO",
              type: type,
              timestamp: new Date().toISOString()
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      logStep("Metadata uploaded successfully", { hash: result.IpfsHash });

      return new Response(JSON.stringify({
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const type = formData.get("type") as string;
      
      if (!file) {
        throw new Error("No file provided");
      }
      
      logStep("Processing file upload", { filename: file.name, type });

      // Create form data for Pinata
      const pinataFormData = new FormData();
      pinataFormData.append("file", file);
      
      const pinataMetadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          service: "TSMO",
          type: type || "file",
          timestamp: new Date().toISOString()
        }
      });
      pinataFormData.append("pinataMetadata", pinataMetadata);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          "pinata_api_key": pinataApiKey,
          "pinata_secret_api_key": pinataSecretKey,
        },
        body: pinataFormData
      });

      if (!response.ok) {
        throw new Error(`Pinata file upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      logStep("File uploaded successfully", { hash: result.IpfsHash });

      return new Response(JSON.stringify({
        hash: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        size: result.PinSize
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } else {
      throw new Error("Unsupported content type");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ipfs-upload", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});