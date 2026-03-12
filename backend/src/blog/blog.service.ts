import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

@Injectable()
export class BlogService {
    private genAI: GoogleGenerativeAI;
    // We will keep a very simple in-memory cache to avoid hitting the API rate limit constantly
    private cachedBlogs: any[] | null = null;
    private lastFetchTime: number = 0;
    private CACHE_TTL = 1000 * 60 * 60; // 1 Hour

    constructor() {
        // Use the explicit API key requested by user
        this.genAI = new GoogleGenerativeAI("AIzaSyB2zSX1K7rLNZmtbUt2JXMuWJKqI2T5imM");
    }

    async getLatestBlogs() {
        const now = Date.now();
        if (this.cachedBlogs && (now - this.lastFetchTime < this.CACHE_TTL)) {
            return this.cachedBlogs;
        }

        try {
            // We use gemini-2.5-flash since it's fast and supports structured JSON outputs well
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    // Enforce a strict schema for the generic 'Blog' architecture
                    responseSchema: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                id: { type: SchemaType.STRING, description: "A url-safe dash-separated slug (e.g. 'the-science-of-hypertrophy')" },
                                title: { type: SchemaType.STRING },
                                excerpt: { type: SchemaType.STRING, description: "A 2 sentence summary of the article" },
                                content_paragraphs: {
                                    type: SchemaType.ARRAY,
                                    items: { type: SchemaType.STRING },
                                    description: "The actual body of the blog, split into 3-5 rich, detailed paragraphs."
                                },
                                author: { type: SchemaType.STRING },
                                date: { type: SchemaType.STRING, description: "A realistic recent date like 'March 5, 2026'" },
                                readTime: { type: SchemaType.STRING, description: "e.g. '5 min read'" },
                                tags: {
                                    type: SchemaType.ARRAY,
                                    items: { type: SchemaType.STRING }
                                }
                            },
                        }
                    }
                }
            });

            const prompt = `
                Act as a professional fitness magazine editor.
                Write 6 fresh, interesting blog articles about sports, self-training, exercise science, and muscle growth.
                Make them sound authoritative but accessible. Ensure variety in topics (e.g., nutrition, recovery, technique).
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            this.cachedBlogs = JSON.parse(responseText);
            this.lastFetchTime = Date.now();

            return this.cachedBlogs;
        } catch (error) {
            console.error("Gemini API Error:", error);
            if (this.cachedBlogs) {
                // If API fails but we have old cache, return old cache rather than breaking
                return this.cachedBlogs;
            }
            throw new InternalServerErrorException('Failed to generate fitness blogs from AI provider.');
        }
    }

    async getBlogById(id: string) {
        // Ensure cache is populated
        if (!this.cachedBlogs) {
            await this.getLatestBlogs();
        }

        const blog = this.cachedBlogs?.find(b => b.id === id);
        if (!blog) {
            throw new InternalServerErrorException(`Blog article with id ${id} not found.`);
        }

        return blog;
    }
}
