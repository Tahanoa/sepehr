/**
 * POLARIS AUTHENTICATION SERVICE INTERFACE & DEMO IMPLEMENTATION
 * Provides session lifecycle management, active membership selection,
 * and dev-only demo identity switching.
 */

import { User, AuthSession, OrganizationMembership } from '../types/auth';
import { DEMO_USERS, DEFAULT_DEMO_USER_ID } from '../data/demo-data';

type AuthStateListener = (session: AuthSession | null) => void;

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<AuthStateListener> = new Set();
  private readonly STORAGE_KEY_USER = 'polaris_demo_user_id';
  private readonly STORAGE_KEY_MEMBERSHIP = 'polaris_active_membership_id';

  constructor() {
    this.initializeSession();
  }

  /**
   * Initializes session from storage or defaults to demo user in dev mode.
   */
  private initializeSession(): void {
    const isDev = import.meta.env.DEV;
    const storedUserId = localStorage.getItem(this.STORAGE_KEY_USER) || DEFAULT_DEMO_USER_ID;
    const storedMembershipId = localStorage.getItem(this.STORAGE_KEY_MEMBERSHIP);

    const user = DEMO_USERS.find((u) => u.id === storedUserId) || DEMO_USERS[0];

    if (user && user.memberships.length > 0) {
      const activeMembership =
        user.memberships.find((m) => m.id === storedMembershipId) ||
        user.memberships.find((m) => m.isPrimary) ||
        user.memberships[0]!;

      this.currentSession = {
        user,
        activeMembershipId: activeMembership.id,
        isDemoSession: isDev,
      };
    }
  }

  public isDevelopmentDemo(): boolean {
    return Boolean(import.meta.env.DEV);
  }

  public getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public getActiveMembership(): OrganizationMembership | null {
    if (!this.currentSession) return null;
    const { user, activeMembershipId } = this.currentSession;
    return user.memberships.find((m) => m.id === activeMembershipId) || user.memberships[0] || null;
  }

  public setActiveMembership(membershipId: string): boolean {
    if (!this.currentSession) return false;

    const membership = this.currentSession.user.memberships.find((m) => m.id === membershipId);
    if (!membership) return false;

    this.currentSession.activeMembershipId = membershipId;
    localStorage.setItem(this.STORAGE_KEY_MEMBERSHIP, membershipId);

    this.notifyListeners();
    return true;
  }

  public async signIn(credentials: { email?: string; password?: string; demoUserId?: string }): Promise<AuthSession> {
    const isDev = import.meta.env.DEV;

    // Development demo user lookup
    let user: User | undefined;
    if (credentials.demoUserId) {
      user = DEMO_USERS.find((u) => u.id === credentials.demoUserId);
    } else if (credentials.email) {
      user = DEMO_USERS.find((u) => u.email.toLowerCase() === credentials.email?.toLowerCase());
    }

    if (!user && isDev) {
      // Fallback to first demo user in development if unspecified
      user = DEMO_USERS[0];
    }

    if (!user || user.memberships.length === 0) {
      throw new Error('نام کاربری یا رمز عبور نامعتبر است.');
    }

    const primaryMembership =
      user.memberships.find((m) => m.isPrimary) || user.memberships[0]!;

    this.currentSession = {
      user,
      activeMembershipId: primaryMembership.id,
      isDemoSession: isDev,
    };

    localStorage.setItem(this.STORAGE_KEY_USER, user.id);
    localStorage.setItem(this.STORAGE_KEY_MEMBERSHIP, primaryMembership.id);

    this.notifyListeners();
    return this.currentSession;
  }

  public async signOut(): Promise<void> {
    this.currentSession = null;
    localStorage.removeItem(this.STORAGE_KEY_USER);
    localStorage.removeItem(this.STORAGE_KEY_MEMBERSHIP);

    this.notifyListeners();
  }

  /**
   * DEV-ONLY: Switch active demo user identity instantly.
   */
  public switchDemoUser(userId: string): AuthSession | null {
    if (!import.meta.env.DEV) {
      console.warn('تغییر کاربر دمو تنها در محیط توسعه مجاز است.');
      return null;
    }

    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user || user.memberships.length === 0) return null;

    const primaryMembership =
      user.memberships.find((m) => m.isPrimary) || user.memberships[0]!;

    this.currentSession = {
      user,
      activeMembershipId: primaryMembership.id,
      isDemoSession: true,
    };

    localStorage.setItem(this.STORAGE_KEY_USER, user.id);
    localStorage.setItem(this.STORAGE_KEY_MEMBERSHIP, primaryMembership.id);

    this.notifyListeners();
    return this.currentSession;
  }

  public onAuthStateChanged(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentSession));
  }
}

export const authService = new AuthService();
