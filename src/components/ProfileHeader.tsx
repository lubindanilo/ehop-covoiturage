import React from 'react';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfilePicture } from './ProfilePicture';
import { UserProfile } from '../types/user';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="relative bg-white p-6 rounded-lg shadow-sm">
      <Link
        to="/settings"
        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
      >
        <Settings className="w-5 h-5" />
      </Link>
      
      <div className="flex items-center space-x-4">
        <ProfilePicture
          url={profile.photoURL}
          userId={profile.id}
          size="lg"
          editable={false}
        />
        
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.description && (
            <p className="text-gray-600 mt-1">{profile.description}</p>
          )}
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-sm">
              <span className="font-semibold">{profile.followerCount}</span>
              <span className="text-gray-500 ml-1">abonnés</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">{profile.followingCount}</span>
              <span className="text-gray-500 ml-1">abonnements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};