import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req: Request) => {
  const url = new URL(req.url)
  const productId = url.searchParams.get('p')

  if (!productId) {
    return Response.redirect('https://permata20.vercel.app/', 302)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  const [productRes, settingsRes] = await Promise.all([
    supabase.from('p20_products').select('name, price, image_url').eq('id', productId).single(),
    supabase.from('p20_settings').select('value').eq('key', 'store_identity').single()
  ])

  const product = productRes.data
  const storeName = settingsRes.data?.value?.name || "Permata 20"

  if (!product) {
    return Response.redirect('https://permata20.vercel.app/', 302)
  }

  const formatPrice = (val: number) => {
    return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${req.url}">
    <meta property="og:title" content="${product.name} - ${storeName}">
    <meta property="og:description" content="Temukan ${product.name} seharga ${formatPrice(product.price)} hanya di ${storeName}. Klik untuk detail produk!">
    <meta property="og:image" content="${product.image_url}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${product.name} - ${storeName}">
    <meta property="twitter:description" content="Temukan ${product.name} seharga ${formatPrice(product.price)} hanya di ${storeName}. Klik untuk detail produk!">
    <meta property="twitter:image" content="${product.image_url}">

    <title>${product.name}</title>
    
    <script>
      window.location.replace("https://permata20.vercel.app/?p=${productId}");
    </script>
    <meta http-equiv="refresh" content="0;url=https://permata20.vercel.app/?p=${productId}">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
    <div style="text-align: center; max-width: 400px; padding: 2rem; background: white; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <p style="margin-bottom: 1rem; color: #64748b;">Sedang mengalihkan Anda...</p>
        <h2 style="margin: 0 0 1rem 0;">${product.name}</h2>
        <a href="https://permata20.vercel.app/?p=${productId}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Klik di sini jika tidak otomatis beralih.</a>
    </div>
</body>
</html>`;

  // Explicitly return binary stream with charset UTF-8 to force browser rendering
  return new Response(new TextEncoder().encode(html), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60"
    }
  })
})
