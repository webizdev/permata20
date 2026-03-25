export default async function handler(req, res) {
  const productId = req.query.p;

  if (!productId) {
    res.redirect(302, '/');
    return;
  }

  const SUPABASE_URL = 'https://uavwpmvpxgckrnubnqex.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fOqPQgsbckJR9PzYV20uZQ_fIwIzU4h';

  const defaultHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    const [productRes, settingsRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/p20_products?id=eq.${productId}&select=name,price,image_url`, { headers: defaultHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/p20_settings?key=eq.store_identity&select=value`, { headers: defaultHeaders })
    ]);

    const products = await productRes.json();
    const settings = await settingsRes.json();

    const product = products && products.length > 0 ? products[0] : null;

    if (!product) {
      res.redirect(302, '/');
      return;
    }

    let storeName = "Permata 20";
    if (settings && settings.length > 0 && settings[0].value && settings[0].value.name) {
      storeName = settings[0].value.name;
    }

    const formatPrice = (val) => {
      return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const imageUrl = product.image_url;
    const ogImageUrl = imageUrl.includes('.jpg') || imageUrl.includes('.png') || imageUrl.includes('.jpeg') 
      ? imageUrl 
      : `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}ext=.jpg`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://permata20.vercel.app/p/${productId}">
    <meta property="og:title" content="${product.name} - ${storeName}">
    <meta property="og:description" content="Temukan ${product.name} seharga ${formatPrice(product.price)} hanya di ${storeName}. Klik untuk detail produk!">
    <meta property="og:image" content="${ogImageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${product.name} - ${storeName}">
    <meta property="twitter:description" content="Temukan ${product.name} seharga ${formatPrice(product.price)} hanya di ${storeName}. Klik untuk detail produk!">
    <meta property="twitter:image" content="${ogImageUrl}">

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

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).send(html);

  } catch (err) {
    console.error(err);
    res.redirect(302, '/');
  }
}
