export interface DriverPreferences {
  communicationStyle: 'quiet' | 'talkative';
  entertainment: 'radio' | 'music' | 'none';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  description?: string;
  followerCount: number;
  followingCount: number;
  driverPreferences?: DriverPreferences;
  createdAt: string;
}