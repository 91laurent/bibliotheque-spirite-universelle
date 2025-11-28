/**
 * Cloudflare Worker - Proxy pour API Google Gemini
 * Ce worker cache la clé API et fait les appels à Google pour le frontend
 */

export default {
  async fetch(request, env) {
    // CORS headers pour permettre les requêtes depuis GitHub Pages
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Gérer les requêtes OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Seules les requêtes POST sont acceptées
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Récupérer les données de la requête
      const body = await request.json();
      const { model, contents, config, systemInstruction, history, message } = body;

      // La clé API est stockée dans les secrets Cloudflare (env.GEMINI_API_KEY)
      const apiKey = env.GEMINI_API_KEY;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let geminiUrl;
      let geminiBody;

      // Deux types d'appels : generateContent ou chat
      if (message && history) {
        // Chat API
        geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        geminiBody = {
          contents: [
            ...history.map(h => ({
              role: h.role,
              parts: h.parts
            })),
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: config || {}
        };
      } else {
        // Generate Content API
        geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        geminiBody = {
          contents: [{ parts: [{ text: contents }] }],
          generationConfig: config || {}
        };
      }

      // Appel à l'API Google Gemini
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiBody)
      });

      // Si c'est du streaming (SSE)
      if (geminiUrl.includes('alt=sse')) {
        return new Response(geminiResponse.body, {
          status: geminiResponse.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }

      // Sinon, réponse JSON normale
      const data = await geminiResponse.json();

      return new Response(JSON.stringify(data), {
        status: geminiResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
