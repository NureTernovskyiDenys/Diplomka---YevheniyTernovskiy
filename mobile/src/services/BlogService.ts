import { BaseService } from './HttpClient';
import { BlogPost } from '../models/BlogPost';

export class BlogService extends BaseService {
    async list(): Promise<BlogPost[]> {
        const res = await this.http.get<any[]>('/blog');
        return BlogPost.fromArray(res ?? []);
    }

    async getById(id: string): Promise<BlogPost> {
        const res = await this.http.get<any>(`/blog/${encodeURIComponent(id)}`);
        return BlogPost.fromJson(res);
    }
}
