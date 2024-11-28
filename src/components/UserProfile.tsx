import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocialStore } from '../store/socialStore';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit 
} from 'firebase/firestore';
import { ProfilePicture } from './ProfilePicture';
import { Chat } from './Chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, UserPlus, UserMinus } from 'lucide-react';

// ... rest of the UserProfile component code remains the same ...