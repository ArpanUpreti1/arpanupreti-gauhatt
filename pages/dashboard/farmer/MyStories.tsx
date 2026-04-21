import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Loader2,
  X,
  Upload,
  Play,
  Heart,
  MessageCircle,
  Link2,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { StoryService, ProductService, API_BASE_URL } from '../../../services/api';
import { Story, StoryListResponse, Product } from '../../../types';
import { StoryCardSkeleton } from '../../../components/Skeleton';

// Story Form Modal
interface StoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: Story | null;
  onSuccess: () => void;
}

const StoryFormModal: React.FC<StoryFormModalProps> = ({ isOpen, onClose, story, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    productId: '',
    videoUrl: '',
    isPublished: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch farmer's products for linking
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await ProductService.getMyProducts(1, 100);
        if (response.success && response.data) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        content: story.content,
        productId: story.productId || '',
        videoUrl: story.videoUrl || '',
        isPublished: story.isPublished,
      });
      if (story.imageUrl) {
        setImagePreview(story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`);
      }
    } else {
      setFormData({
        title: '',
        content: '',
        productId: '',
        videoUrl: '',
        isPublished: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setError(null);
  }, [story, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('isPublished', formData.isPublished.toString());
    if (formData.productId) {
      formDataToSend.append('productId', formData.productId);
    }
    if (formData.videoUrl) {
      formDataToSend.append('videoUrl', formData.videoUrl);
    }
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const response = story 
        ? await StoryService.update(story.id, formDataToSend)
        : await StoryService.create(formDataToSend);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to save story');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {story ? 'Edit Story' : 'Create New Story'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div 
                className={`relative border-2 border-dashed rounded-xl transition-colors
                           ${imagePreview ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                {imagePreview ? (
                  <div className="relative aspect-video">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full
                               hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., How I Started Organic Farming"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500
                         focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Story <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your farming journey, techniques, or the story behind your products..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500
                         focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.content.length}/5000 characters</p>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (Optional)
              </label>
              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500
                           focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Add a YouTube or Vimeo link to include a video</p>
            </div>

            {/* Link to Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Product (Optional)
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  disabled={loadingProducts}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500
                           focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none
                           bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">No product linked</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Rs. {product.price}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Link this story to one of your products</p>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  {formData.isPublished ? <Eye className="w-5 h-5 text-purple-600" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Publish Story</p>
                  <p className="text-sm text-gray-500">
                    {formData.isPublished ? 'Your story will be visible to everyone' : 'Save as draft'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200
                           ${formData.isPublished ? 'bg-purple-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform
                               ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-medium
                     hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {story ? 'Update Story' : 'Publish Story'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  storyTitle: string;
  loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, storyTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Delete Story</h3>
        <p className="text-center text-gray-500 mb-6">
          Are you sure you want to delete <strong>"{storyTitle}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium
                     hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium
                     hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Story Card Component
const StoryCard: React.FC<{
  story: Story;
  index: number;
  onEdit: (story: Story) => void;
  onDelete: (story: Story) => void;
  onTogglePublish: (story: Story) => void;
}> = ({ story, index, onEdit, onDelete, onTogglePublish }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = story.imageUrl 
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : null;

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 
                group hover:shadow-lg transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={story.title}
            className={`w-full h-full object-cover transition-transform duration-500
                       ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <BookOpen className="w-12 h-12 text-purple-300" />
          </div>
        )}
        
        {/* Video indicator */}
        {story.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg
                          group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 text-purple-600 ml-1" />
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm
                         ${story.isPublished 
                           ? 'bg-green-500 text-white' 
                           : 'bg-gray-500 text-white'}`}>
            {story.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Menu button */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-scale-in">
                  <button
                    onClick={() => {
                      onEdit(story);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Story
                  </button>
                  <button
                    onClick={() => {
                      onTogglePublish(story);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {story.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {story.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      onDelete(story);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Story
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {story.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {story.content}
        </p>

        {/* Linked Product */}
        {story.productName && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg mb-4">
            <Link2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700 font-medium truncate">
              Linked to: {story.productName}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {story.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {story.likeCount}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(story.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component
const MyStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await StoryService.getMyStories(page, 12);
      if (response.success && response.data) {
        setStories(response.data.stories);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setShowFormModal(true);
  };

  const handleDeleteClick = (story: Story) => {
    setSelectedStory(story);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStory) return;
    
    setDeleteLoading(true);
    try {
      const response = await StoryService.delete(selectedStory.id);
      if (response.success) {
        fetchStories();
        setShowDeleteModal(false);
        setSelectedStory(null);
      }
    } catch (error) {
      console.error('Failed to delete story:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTogglePublish = async (story: Story) => {
    try {
      const formData = new FormData();
      formData.append('isPublished', (!story.isPublished).toString());
      await StoryService.update(story.id, formData);
      fetchStories();
    } catch (error) {
      console.error('Failed to toggle story status:', error);
    }
  };

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalStories = stories.length;
  const publishedStories = stories.filter(s => s.isPublished).length;
  const totalViews = stories.reduce((sum, s) => sum + s.viewCount, 0);
  const totalLikes = stories.reduce((sum, s) => sum + s.likeCount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Stories</h1>
          <p className="text-gray-500">Share your farming journey with customers</p>
        </div>
        <button
          onClick={() => {
            setSelectedStory(null);
            setShowFormModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white
                   rounded-xl font-medium hover:bg-purple-600 transition-all shadow-lg 
                   shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40
                   transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Create Story
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Stories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStories}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up" style={{animationDelay: '50ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{publishedStories}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalViews}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up" style={{animationDelay: '150ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-3xl font-bold text-red-500 mt-1">{totalLikes}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500
                     focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try a different search term' : 'Start sharing your farming journey'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setSelectedStory(null);
                setShowFormModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white
                       rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Story
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors
                        ${page === i + 1 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <StoryFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedStory(null);
        }}
        story={selectedStory}
        onSuccess={fetchStories}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStory(null);
        }}
        onConfirm={handleDeleteConfirm}
        storyTitle={selectedStory?.title || ''}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyStories;
