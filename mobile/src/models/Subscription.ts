export interface SubscriptionPlanData {
    _id: string;
    name: string;
    price: number;
    features: string[];
    durationInDays: number;
}

export class SubscriptionPlan {
    public readonly id: string;
    public readonly name: string;
    public readonly price: number;
    public readonly features: string[];
    public readonly durationInDays: number;

    constructor(data: SubscriptionPlanData) {
        this.id = data._id;
        this.name = data.name;
        this.price = data.price;
        this.features = data.features ?? [];
        this.durationInDays = data.durationInDays;
    }

    get isFree(): boolean {
        return this.price === 0;
    }

    get isPremium(): boolean {
        return this.price > 0 || this.name.toLowerCase().includes('premium');
    }

    get pricingLabel(): string {
        return this.isFree ? 'Free' : `$${this.price.toFixed(2)}`;
    }

    static fromJson(json: any): SubscriptionPlan {
        return new SubscriptionPlan(json as SubscriptionPlanData);
    }

    static fromArray(json: any[]): SubscriptionPlan[] {
        return (json ?? []).map(SubscriptionPlan.fromJson);
    }
}
