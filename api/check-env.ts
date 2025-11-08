
export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET' } 
    });
  }

  const apiKey = process.env.API_KEY;

  if (apiKey && apiKey.length > 0) {
    // To avoid leaking the key, we just confirm its presence and show its first few and last few characters.
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    return new Response(JSON.stringify({
      status: 'success',
      message: `✅ La variable d'environnement API_KEY est configurée avec succès.`,
      keyPreview: maskedKey
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({
      status: 'error',
      message: `❌ ERREUR : La variable d'environnement API_KEY est manquante ou vide. Veuillez la configurer dans les paramètres de votre projet Vercel et redéployer.`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
