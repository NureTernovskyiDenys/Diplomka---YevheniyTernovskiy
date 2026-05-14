import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

@Injectable()
export class BlogService {
  private genAI: GoogleGenerativeAI;
  private cachedBlogs: any[] | null = null;
  private lastFetchTime: number = 0;
  private CACHE_TTL = 1000 * 60 * 60; // 1 Hour

  constructor(private configService: ConfigService) {

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      console.error('CRITICAL WARNING: GEMINI_API_KEY is missing from your .env file!');
    }

    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async getLatestBlogs() {
    const now = Date.now();
    if (this.cachedBlogs && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedBlogs;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: {
                  type: SchemaType.STRING,
                  description:
                    "A url-safe dash-separated slug (e.g. 'the-science-of-hypertrophy')",
                },
                title: { type: SchemaType.STRING },
                excerpt: {
                  type: SchemaType.STRING,
                  description: 'A 2 sentence summary of the article',
                },
                content_paragraphs: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description:
                    'The actual body of the blog, split into 3-5 rich, detailed paragraphs.',
                },
                author: { type: SchemaType.STRING },
                date: {
                  type: SchemaType.STRING,
                  description: "A realistic recent date like 'March 5, 2026'",
                },
                readTime: {
                  type: SchemaType.STRING,
                  description: "e.g. '5 min read'",
                },
                tags: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
            },
          },
        },
      });

      const prompt = `
                Act as a professional fitness magazine editor.
                Write 6 fresh, interesting blog articles about sports, self-training, exercise science, and muscle growth.
                Make them sound authoritative but accessible. Ensure variety in topics (e.g., nutrition, recovery, technique).
            `;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();

      // 4. Safety measure: Strip out any markdown blocks if the AI hallucinates them
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      this.cachedBlogs = JSON.parse(responseText);
      this.lastFetchTime = Date.now();

      return this.cachedBlogs;
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (this.cachedBlogs) {
        return this.cachedBlogs;
      }
      throw new InternalServerErrorException(
        'Failed to generate fitness blogs from AI provider.',
      );
    }
  }

  async getBlogById(id: string) {
    // Ensure cache is populated
    if (!this.cachedBlogs) {
      await this.getLatestBlogs();
    }

    const blog = this.cachedBlogs?.find((b) => b.id === id);
    if (!blog) {
      throw new InternalServerErrorException(
        `Blog article with id ${id} not found.`,
      );
    }

    return blog;
  }
}