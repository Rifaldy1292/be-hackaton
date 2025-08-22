import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LunosService {
  private readonly apiKey = process.env.LUNOS_API_KEY;
  private readonly baseUrl = process.env.LUNOS_API_URL; // contoh: https://api.lunos.tech/v1

  async analyzeText(prompt: string) {
    // Pastikan endpoint, model, dan payload sesuai dokumen Lunos
    const endpoint = `${this.baseUrl}/chat/completions`;

    // Default model, bisa ganti sesuai daftar model support Lunos
    const model = 'openai/gpt-4o';

    // Format body mengikuti OpenAI API
    const data = {
      model,
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah asisten AI ahli pertanian. Jawablah semua pertanyaan hanya seputar dunia pertanian. Jika pertanyaan tidak berkaitan dengan pertanian, tolak dengan sopan.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      // max_tokens: 256, // opsional, bisa tambahkan kalau mau limit output
    };

    try {
      const response = await axios.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      // Ambil output sesuai format Lunos/OpenAI
      return {
        result: response.data?.choices?.[0]?.message?.content ?? '',
        provider: 'lunos',
        usage: response.data?.usage,
        model: response.data?.model,
      };
    } catch (err) {
      // Log error yang rapi & return error message yang jelas
      console.error(
        'Lunos AI error:',
        err.message,
        err.response?.status,
        err.response?.data,
      );
      throw new Error(
        err.response?.data?.error?.message || 'Lunos AI provider error',
      );
    }
  }
}
