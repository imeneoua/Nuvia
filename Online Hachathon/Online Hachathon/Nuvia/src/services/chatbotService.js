// Removed Gemini/Deepseek SDK imports
import staticResponses from '../data/static-responses.json';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "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";

/**
 * Normalizes text to help with matching
 */
const normalizeText = (text) => {
  return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Level 1: Static Prompt Routing
 */
const getStaticResponse = (message) => {
  const normalizedMsg = normalizeText(message);
  for (const item of staticResponses) {
    if (item.keywords.some(kw => normalizedMsg.includes(normalizeText(kw)))) {
      return item.response;
    }
  }
  return null;
};

/**
 * Level 3: LLM Fallback (Groq API)
 * Calls the Groq API to get a culinary response.
 */
const getLLMResponse = async (message, lang) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Supported Groq model
        messages: [
          {
            role: "system",
            content: `Tu es l'assistant culinaire intelligent de la plateforme Nuvia. Ton rôle est d'aider les utilisateurs avec leurs questions sur la cuisine, les recettes, et les ingrédients. IMPORTANT : Si l'utilisateur te pose une question qui n'est pas liée à la cuisine, à la nourriture ou aux recettes (par exemple: géographie, capitale d'un pays, politique, mathématiques, etc.), tu dois poliment refuser de répondre en lui rappelant que tu es exclusivement un assistant culinaire. Réponds de manière concise, polie et experte. Tu DOIS IMPÉRATIVEMENT répondre dans cette langue : ${lang === 'fr' ? 'Français' : lang === 'en' ? 'Anglais' : 'Arabe'}.`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq API Error:", data.error);
      return `Chatbot non disponible`;
      // la phase de TEST : return `Désolé, erreur avec l'API Groq : ${data.error.message || "Erreur inconnue"}`;
    }

  } catch (error) {
    console.error("Erreur avec l'API Groq:", error);
    return "Désolé, je rencontre des difficultés techniques pour joindre mon cerveau culinaire (Erreur de connexion API).";
  }
};

/**
 * Helper: Translate English recipes to the target language using LLM
 */
const translateRecipe = async (text, lang) => {
  if (lang === 'en') return text; // Pas besoin de traduire si on est déjà en anglais

  const targetLanguage = lang === 'fr' ? 'français' : 'arabe';

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Tu es un traducteur culinaire expert. Traduis la recette suivante de l'anglais vers le ${targetLanguage} de manière claire et appétissante.`
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });
    const data = await response.json();
    if (!data.error) {
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
  return text; // Return original text if translation fails
};

// --- Real Local Recipe Database (Level 2 RAG) ---
/**
 * Level 2: Local Recipe Search (RAG)
 * Calls the local Python backend to search the 1M recipe dataset.
 */
const getLocalRecipe = async (message) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(message)}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.found && data.recipe_text) {
      return data.recipe_text;
    }
  } catch (error) {
    console.error("Local RAG Backend Error:", error);
    // If the backend isn't running, gracefully fail to LLM
  }
  return null;
};

/**
 * Main Chatbot Routing Logic
 */
export const processChatMessage = async (message, lang = 'fr') => {
  // 1. Static Prompt
  const staticMatch = getStaticResponse(message);
  if (staticMatch) {
    console.log("[Chatbot] Routing: Static");
    // Translate static match if not French
    if (lang !== 'fr') {
      return await translateRecipe(staticMatch, lang);
    }
    return staticMatch;
  }

  // 2. RAG Prompt (Local Recipes Database)
  let recipeMatch = await getLocalRecipe(message);
  if (recipeMatch) {
    console.log("[Chatbot] Routing: Local RAG (Found real recipe)");
    // Translate the raw English dataset recipe to the target language so the TTS can read it properly
    recipeMatch = await translateRecipe(recipeMatch, lang);

    if (lang === 'ar') return `لقد وجدت الوصفة المثالية في قاعدة بياناتنا:\n\n${recipeMatch}\n\nبالهناء والشفاء!`;
    if (lang === 'en') return `I found the perfect recipe in our database:\n\n${recipeMatch}\n\nEnjoy your meal!`;
    return `J'ai trouvé la recette parfaite dans notre base de données :\n\n${recipeMatch}\n\nBon appétit !`;
  }

  // 3. Fallback LLM (Gemini)
  console.log("[Chatbot] Routing: LLM Fallback");
  const llmResponse = await getLLMResponse(message, lang);

  // Hackathon Fallback: If API fails, return a graceful generic message instead of an error
  if (llmResponse && llmResponse.includes("Erreur avec l'API")) {
    return "Je suis désolé, mon IA avancée est actuellement déconnectée (Problème de clé API Gemini). Mais je peux toujours vous donner des recettes de Tiramisu, de pâtes ou d'œufs si vous le souhaitez !";
  }

  return llmResponse || "Désolé, je rencontre des difficultés techniques pour joindre mon cerveau culinaire.";
};
