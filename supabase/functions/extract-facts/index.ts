// Supabase Edge Function: extract-facts
// Extracts structured facts from an AI interrogation response

import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { aiResponse, character } = await req.json();

    if (!aiResponse || !character) {
      return new Response(
        JSON.stringify({ error: 'Missing aiResponse or character' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    const prompt = `Extract concrete facts from this interrogation response.

CHARACTER: ${character}
RESPONSE: """${aiResponse}"""

Return a JSON array. Each item must have:
{
  "fact_text": "<specific, quotable fact stated or implied>",
  "source": "${character}",
  "relevance_score": <0.0–1.0>
}

Rules:
- Only extract verifiable facts (not opinions or vague statements).
- Include alibi claims, relationship details, timeline information, or knowledge of events.
- If no facts are extractable, return an empty array [].
- Return ONLY the JSON array, no other text.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '[]';

    let facts = [];
    try {
      facts = JSON.parse(raw);
    } catch {
      facts = [];
    }

    return new Response(
      JSON.stringify({ facts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
