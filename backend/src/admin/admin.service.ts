import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
// additional imports can be added as necessary for full admin control

@Injectable()
export class AdminService {
    constructor(
        private readonly usersService: UsersService,
        private readonly subscriptionsService: SubscriptionsService,
    ) { }

    async getAllUsers() {
        return this.usersService.findAll();
    }

    async getAllSubscriptions() {
        return this.subscriptionsService.findAll();
    }

    async setRole(userId: string, role: string) {
        return this.usersService.update(userId, { role });
    }

    // Dashboard-like aggregation could be added here
}
