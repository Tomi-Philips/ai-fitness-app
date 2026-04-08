const axios = require('axios');

/**
 * AI Service for personalized fitness recommendations.
 * Implements a failover mechanism: Groq (Primary) -> Hugging Face (Fallback).
 */
const aiService = {
  /**
   * Primary: Generate recommendation using Groq (Llama 3)
   */
  async generateWithGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      throw new Error('Groq API Key is not configured');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an elite AI Fitness Coach. Give short, high-energy 2-sentence workout recommendations based on user data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout for Groq
      }
    );

    return response.data.choices[0].message.content;
  },

  /**
   * Fallback: Generate recommendation using Hugging Face (Mistral/Llama via Inference API)
   */
  async generateWithHuggingFace(prompt) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey.includes('your_huggingface_api_key')) {
      throw new Error('Hugging Face API Key is not configured');
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        inputs: `<s>[INST] You are an elite AI Fitness Coach. Give a short, high-energy 2-sentence workout recommendation based on this data: ${prompt} [/INST]`,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout for HF
      }
    );

    // Hugging Face returns an array of generated texts
    return response.data[0]?.generated_text || 'Keep pushing your limits!';
  },

  /**
   * Master Method: Attempt Groq first, then Fallback to Hugging Face
   */
  async getRecommendation(userProfile, activityData) {
    const prompt = `User Stats: Age ${userProfile.age}, Weight ${userProfile.weight}kg, Goal ${userProfile.fitness_goal}. 
    Activity Today: ${activityData.steps} steps, ${activityData.calories} calories burned.`;

    console.log('🤖 AI Coach: Attempting Primary Generation (Groq)...');
    try {
      return await this.generateWithGroq(prompt);
    } catch (error) {
      console.warn('⚠️ Groq Primary Failed:', error.message);
      console.log('🔄 AI Coach: Switching to Fallback (Hugging Face)...');
      
      try {
        return await this.generateWithHuggingFace(prompt);
      } catch (fallbackError) {
        console.error('❌ Both AI Providers Failed:', fallbackError.message);
        return "You're doing great! Keep up the consistency and stay hydrated. Your coach is rooting for you!";
      }
    }
  }
};

module.exports = aiService;
