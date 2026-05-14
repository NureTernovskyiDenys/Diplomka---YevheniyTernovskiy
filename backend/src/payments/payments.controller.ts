import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-subscription')
    createSubscription(
        @Body()
        body: {
            planId: string;
            amount: number;
            currency: string;
            description: string;
            userId: string;
        },
    ) {
        const orderId = `sub_${body.userId}_${body.planId}_${Date.now()}`;

        return this.paymentsService.createSubscriptionPayment({
            orderId,
            amount: body.amount,
            currency: body.currency,
            description: body.description,
            resultUrl: 'http://localhost:8081/payment-result',
            serverUrl: 'http://localhost:3000/api/nest/payments/webhook',
        });
    }

    @Post('webhook')
    @HttpCode(200)
    handleWebhook(@Body() body: { data: string; signature: string }) {
        const isValid = this.paymentsService.verifyCallback(
            body.data,
            body.signature,
        );

        if (!isValid) {
            console.error('LiqPay webhook: invalid signature');
            return { status: 'error' };
        }

        const decoded = this.paymentsService.decodeCallbackData(body.data);
        console.log('LiqPay payment callback:', decoded);

        // TODO: оновити підписку користувача в БД
        // decoded.status === 'sandbox' means success in sandbox mode

        return { status: 'ok' };
    }
}