import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostsStore } from '../store/postsStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useInView } from 'react-intersection-observer';
import { AlertCircle } from 'lucide-react';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfilePicture } from '../components/ProfilePicture';

export const Profile = () => {
  const { user } = useAuthStore();
  const { 
    posts, 
    loading, 
    error, 
    hasMore,
    fetchUserPosts, 
    loadMorePosts 
  } = usePostsStore();
  
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (user) {
      fetchUserPosts(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (inView && hasMore && !loading && user) {
      loadMorePosts(user.uid);
    }
  }, [inView, hasMore, loading, user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Utilisateur non trouvé</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader 
        profile={{
          id: user.uid,
          name: user.displayName || 'Utilisateur',
          email: user.email || '',
          photoURL: user.photoURL,
          followerCount: 0,
          followingCount: 0,
          createdAt: user.metadata.creationTime || new Date().toISOString()
        }} 
      />

      {/* Posts Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Publications</h2>
        
        {error ? (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <ProfilePicture
                    url={user.photoURL || undefined}
                    userId={user.uid}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(post.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-800">{post.content}</p>
                
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="mt-2 rounded-lg max-h-96 w-full object-cover"
                  />
                )}
                
                <div className="mt-2 flex items-center space-x-4 text-gray-500">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} commentaires</span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            )}
            
            {hasMore && !loading && (
              <div ref={loadMoreRef} className="h-4" />
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                Plus aucune publication à afficher
              </div>
            )}
            
            {!hasMore && posts.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Aucune publication pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};