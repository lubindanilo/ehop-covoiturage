import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ThumbsUp, MessageCircle, Share2, MoreVertical, Image as ImageIcon } from 'lucide-react';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export const Feed = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const fetchedPosts = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch user avatar if available
          let userAvatar;
          if (data.userId) {
            try {
              const avatarRef = ref(storage, `avatars/${data.userId}`);
              userAvatar = await getDownloadURL(avatarRef);
            } catch (error) {
              console.error('Error fetching avatar:', error);
            }
          }
          return {
            id: doc.id,
            ...data,
            userAvatar,
          } as Post;
        })
      );
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    setIsCreatingPost(true);
    try {
      let imageUrl;
      if (postImage) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, postImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Utilisateur anonyme',
        content: newPost,
        imageUrl,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });

      setNewPost('');
      setPostImage(null);
      setImagePreview(null);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Implement like functionality
  };

  const handleComment = (postId: string) => {
    // Implement comment functionality
  };

  const handleShare = (postId: string) => {
    // Implement share functionality
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-20">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          )}
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Partagez votre trajet..."
            className="flex-1 p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {imagePreview && (
          <div className="relative mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-60 rounded-lg object-cover"
            />
            <button
              onClick={() => {
                setPostImage(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600"
          >
            <ImageIcon className="h-5 w-5" />
            <span>Ajouter une photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            onClick={createPost}
            disabled={!newPost.trim() || isCreatingPost}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingPost ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {post.userAvatar ? (
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                )}
                <div>
                  <div className="font-medium">{post.userName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 py-2">
              <p className="text-gray-800">{post.content}</p>
            </div>
            {post.imageUrl && (
              <div className="mt-2">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="px-4 py-3 border-t flex justify-between">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600"
              >
                <ThumbsUp className="h-5 w-5" />
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => handleComment(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments}</span>
              </button>
              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};