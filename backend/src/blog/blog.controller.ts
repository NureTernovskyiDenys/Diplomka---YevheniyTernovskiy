import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get()
    getBlogs() {
        return this.blogService.getLatestBlogs();
    }

    @Get(':id')
    getBlogById(@Param('id') id: string) {
        return this.blogService.getBlogById(id);
    }
}
