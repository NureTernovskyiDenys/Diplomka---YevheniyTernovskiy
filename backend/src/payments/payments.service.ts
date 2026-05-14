import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
    private readonly publicKey: string;
    private readonly privateKey: string;

    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {
        this.publicKey = this.configService.get<string>('LIQPAY_PUBLIC_KEY') ?? '';
        this.privateKey = this.configService.get<string>('LIQPAY_PRIVATE_KEY') ?? '';
    }

    createSubscriptionPayment(params: {
        orderId: string;
        amount: number;
        currency: string;
        description: string;
        resultUrl: string;
        serverUrl: string;
    }) {
        const paymentData = {
            public_key: this.publicKey,
            version: '3',
            action: 'pay',
            amount: params.amount,
            currency: 'UAH',
            description: params.description,
            order_id: params.orderId,
            result_url: params.resultUrl,
            server_url: params.serverUrl,
        };

        const data = Buffer.from(JSON.stringify(paymentData)).toString('base64');
        const signature = this.generateSignature(data);

        return { data, signature };
    }

    async activateSubscription(userId: string, planId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, {
            'subscription.planId': planId,
            'subscription.active': true,
            'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
    }

    private generateSignature(data: string): string {
        const str = this.privateKey + data + this.privateKey;
        return crypto.createHash('sha1').update(str).digest('base64');
    }

    verifyCallback(data: string, signature: string): boolean {
        const expected = this.generateSignature(data);
        return expected === signature;
    }

    decodeCallbackData(data: string): any {
        return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    }
}
