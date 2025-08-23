import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class UnliService {
  private readonly openai = new OpenAI({
    baseURL: process.env.UNLI_API_URL,
    apiKey: process.env.UNLI_API_KEY,
  });

  async analyzeText(prompt: string) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'Kamu adalah asisten AI ahli pertanian. Jawablah semua pertanyaan hanya seputar dunia pertanian ,jika hanya gambar tanaman coba analisa itu merupakan tanaman sehat atau tidak ,coba juga cek apakah tanaman itu memiliki potensi tidak subur dari daunya atu apa  . Jika pertanyaan tidak berkaitan dengan pertanian, tolak dengan sopan, dan selalu jawab dengan bahasa indonesia.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'auto',
      messages,
    });

    return {
      result: completion.choices?.[0]?.message?.content ?? '',
      provider: 'unli',
      usage: completion.usage,
      model: completion.model,
    };
  }

  async analyzeImage(file: Express.Multer.File, prompt: string) {
    try {
      const buffer = await fs.readFile(file.path);
      const base64 = buffer.toString('base64');

      const messages = [
        {
          role: 'system',
          content:
            'Kamu adalah asisten AI ahli pertanian. Jawablah semua pertanyaan hanya seputar dunia pertanian ,jika hanya gambar tanaman coba analisa itu merupakan tanaman sehat atau tidak ,coba juga cek apakah tanaman itu memiliki potensi tidak subur dari daunya atu apa  . Jika pertanyaan tidak berkaitan dengan pertanian, tolak dengan sopan, dan selalu jawab dengan bahasa indonesia.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${file.mimetype};base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ];
      console.log(messages);
      const completion = await this.openai.chat.completions.create({
        model: 'auto',
        messages: messages as any,
      });

      return {
        result: completion.choices?.[0]?.message?.content ?? '',
        provider: 'unli',
        usage: completion.usage,
        model: completion.model,
      };
    } finally {
      await fs.unlink(file.path).catch(() => {});
    }
  }
}
