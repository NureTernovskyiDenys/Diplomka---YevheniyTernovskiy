export interface BlogPostData {
    id: string;
    title: string;
    excerpt: string;
    content_paragraphs?: string[];
    author?: string;
    date?: string;
    readTime?: string;
    tags?: string[];
}

export class BlogPost {
    public readonly id: string;
    public readonly title: string;
    public readonly excerpt: string;
    public readonly contentParagraphs: string[];
    public readonly author: string;
    public readonly date: string;
    public readonly readTime: string;
    public readonly tags: string[];

    constructor(data: BlogPostData) {
        this.id = data.id;
        this.title = data.title;
        this.excerpt = data.excerpt;
        this.contentParagraphs = data.content_paragraphs ?? [];
        this.author = data.author ?? 'AI Editor';
        this.date = data.date ?? '';
        this.readTime = data.readTime ?? '5 min read';
        this.tags = data.tags ?? [];
    }

    static fromJson(json: any): BlogPost {
        return new BlogPost(json as BlogPostData);
    }

    static fromArray(json: any[]): BlogPost[] {
        return (json ?? []).map(BlogPost.fromJson);
    }
}
