export type Gender = 'Male' | 'Female';

export interface UserProfileData {
    weight?: number;
    height?: number;
    age?: number;
    gender?: Gender;
    illnesses?: string;
    fitnessGoals?: string;
    tdee?: number;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    macroDietName?: string;

    // Onboarding additions
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very';
    weeklyWorkoutDays?: number;
    sessionDuration?: '15-30' | '30-45' | '45-60' | '60+';
    goalsList?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    onboardingComplete?: boolean;
}

export interface UserSubscriptionData {
    planId?: string;
    active?: boolean;
    expiresAt?: string;
}

export interface UserData {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'admin';
    profile?: UserProfileData;
    subscription?: UserSubscriptionData;
    createdAt?: string;
    updatedAt?: string;
}

export class User {
    public readonly id: string;
    public readonly email: string;
    public firstName: string;
    public lastName: string;
    public readonly role: 'user' | 'admin';
    public profile: UserProfileData;
    public subscription: UserSubscriptionData;

    constructor(data: UserData) {
        this.id = data._id;
        this.email = data.email;
        this.firstName = data.firstName ?? '';
        this.lastName = data.lastName ?? '';
        this.role = data.role ?? 'user';
        this.profile = data.profile ?? {};
        this.subscription = data.subscription ?? {};
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim() || this.email;
    }

    get initials(): string {
        const parts = this.fullName.split(' ').filter(Boolean);
        const head = parts[0]?.[0] ?? this.email[0] ?? '?';
        const tail = parts[1]?.[0] ?? '';
        return (head + tail).toUpperCase();
    }

    get hasNutritionTargets(): boolean {
        return !!(
            this.profile.targetCalories &&
            this.profile.targetProtein &&
            this.profile.targetCarbs &&
            this.profile.targetFat
        );
    }

    get hasActiveSubscription(): boolean {
        if (!this.subscription?.active) return false;
        if (!this.subscription.expiresAt) return true;
        return new Date(this.subscription.expiresAt).getTime() > Date.now();
    }

    get isAdmin(): boolean {
        return this.role === 'admin';
    }

    static fromJson(json: any): User {
        return new User(json as UserData);
    }
}
