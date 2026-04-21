import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  BookOpen,
  Heart,
  Eye,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Link2,
  Loader2,
  User,
  Calendar,
  MapPin,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react';
import { StoryService, API_BASE_URL } from '../../services/api';
import { Story, StoryFilter } from '../../types';
import { StoryGridSkeleton } from '../../components/Skeleton';

// Story Detail Modal
interface StoryDetailModalProps {
  story: Story | null;
  onClose: () => void;
  onLike: (id: string) => void;
}

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, onClose, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.likeCount || 0);

  useEffect(() => {
    if (story) {
      setLiked(false);
      setLikeCount(story.likeCount);
    }
  }, [story]);

  if (!story) return null;

  const imageUrl = story.imageUrl 
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : null;

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      onLike(story.id);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: story.title,
        text: story.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } catch (err) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header with image */}
        <div className="relative">
          {imageUrl ? (
            <div className="relative aspect-video">
              <img 
                src={imageUrl} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              
              {/* Video play button */}
              {story.videoUrl && (
                <a 
                  href={story.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl
                                group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-purple-600 ml-1" />
                  </div>
                </a>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/30" />
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white
                     hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {story.farmerName}
              </span>
              {story.farmName && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {story.farmName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(story.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[40vh]">
          {/* Linked Product */}
          {story.productName && (
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl mb-6
                          border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Featured Product</p>
                  <p className="font-medium text-gray-900">{story.productName}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white 
                               rounded-full text-sm font-medium hover:bg-purple-600 transition-colors">
                <ShoppingCart className="w-4 h-4" />
                View Product
              </button>
            </div>
          )}

          {/* Story content */}
          <div className="prose prose-lg max-w-none">
            {story.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-lg transition-all duration-300
                        ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current animate-bounce-subtle' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>
            <span className="flex items-center gap-2 text-gray-500">
              <Eye className="w-6 h-6" />
              <span className="font-medium">{story.viewCount}</span>
            </span>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full
                     text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
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
  onClick: () => void;
}> = ({ story, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = story.imageUrl 
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_BASE_URL}${story.imageUrl}`)
    : null;

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 
                cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {!imageLoaded && imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        )}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={story.title}
            className={`w-full h-full object-cover transition-all duration-500
                       ${isHovered ? 'scale-110' : 'scale-100'}
                       ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <BookOpen className="w-12 h-12 text-purple-300" />
          </div>
        )}
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                        transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Video indicator */}
        {story.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg
                          transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              <Play className="w-6 h-6 text-purple-600 ml-1" />
            </div>
          </div>
        )}

        {/* Read time / stats overlay */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 text-white
                        transform transition-all duration-300
                        ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <p className="text-sm font-medium">Read full story →</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 
                     group-hover:text-purple-600 transition-colors duration-200">
          {story.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {story.content}
        </p>

        {/* Farmer info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 
                          flex items-center justify-center text-white font-medium text-sm">
              {story.farmerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{story.farmerName}</p>
              {story.farmName && (
                <p className="text-xs text-gray-500">{story.farmName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {story.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {story.likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Stories Page Component
const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<StoryFilter>({
    page: 1,
    pageSize: 12,
    sortBy: 'newest',
  });
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setFilter(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await StoryService.getAll(filter);
      if (response.success && response.data) {
        setStories(response.data.stories);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStoryClick = async (story: Story) => {
    setSelectedStory(story);
  };

  const handleLike = async (id: string) => {
    try {
      await StoryService.like(id);
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleSortChange = (sortBy: string) => {
    setFilter(prev => ({ ...prev, sortBy: sortBy as 'newest' | 'popular' | 'views', page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full 
                          backdrop-blur-sm text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Farm Stories
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Stories from the Fields
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover the authentic journeys of local farmers. Learn about their farming practices, 
              traditions, and the love that goes into growing your food.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto animate-fade-in-up">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 
                         placeholder-gray-400 shadow-xl shadow-black/10
                         border-2 border-transparent focus:border-purple-300
                         transition-all duration-200 outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                           hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sort tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {[
              { label: 'Latest', value: 'newest' },
              { label: 'Most Popular', value: 'popular' },
              { label: 'Most Viewed', value: 'views' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${filter.sortBy === option.value
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `${stories.length} stories`
            )}
          </p>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <StoryGridSkeleton count={6} />
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                index={index}
                onClick={() => handleStoryClick(story)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Check back later for new stories'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setFilter(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
              disabled={filter.page === 1}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setFilter(prev => ({ ...prev, page: pageNum }))}
                  className={`w-10 h-10 rounded-full font-medium transition-all duration-200
                            ${filter.page === pageNum 
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setFilter(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
              disabled={filter.page === totalPages}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onLike={handleLike}
        />
      )}
    </div>
  );
};

export default StoriesPage;
