// src/components/Rating/RatingComponents.tsx
import React, { useState } from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  serviceId?: number;
  serviceName?: string;
  isVerified?: boolean;
}

interface RatingDisplayProps {
  rating?: number;
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCount?: boolean;
  interactive?: boolean;
  onRatingClick?: (rating: number) => void;
  className?: string;
}

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
}

interface ReviewFormProps {
  onSubmit: (review: Omit<Review, 'id' | 'userId' | 'userName' | 'userAvatar' | 'date'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  services?: Array<{ id: number; name: string }>;
  maxLength?: number;
}

interface ReviewListProps {
  reviews: Review[];
  showServiceName?: boolean;
  maxVisible?: number;
  onLoadMore?: () => void;
  loading?: boolean;
  className?: string;
}

// Enhanced Rating Display Component
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating = 0,
  reviewCount = 0,
  size = 'md',
  showCount = true,
  interactive = false,
  onRatingClick,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const currentRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(currentRating);
  const hasHalfStar = currentRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Stars */}
      <div className="flex items-center space-x-0.5">
        {/* Full Stars */}
        {Array(fullStars).fill(0).map((_, i) => (
          <button
            key={`full-${i}`}
            type="button"
            className={`${sizeClasses[size]} text-amber-400 ${
              interactive 
                ? 'cursor-pointer hover:text-amber-500 hover:scale-110 transition-all' 
                : 'cursor-default'
            }`}
            onClick={() => interactive && onRatingClick?.(i + 1)}
            disabled={!interactive}
          >
            <StarSolid />
          </button>
        ))}
        
        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative">
            <StarOutline className={`${sizeClasses[size]} text-slate-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <StarSolid className={`${sizeClasses[size]} text-amber-400`} />
            </div>
          </div>
        )}
        
        {/* Empty Stars */}
        {Array(emptyStars).fill(0).map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            className={`${sizeClasses[size]} text-slate-300 ${
              interactive 
                ? 'cursor-pointer hover:text-amber-300 hover:scale-110 transition-all' 
                : 'cursor-default'
            }`}
            onClick={() => interactive && onRatingClick?.(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
            disabled={!interactive}
          >
            <StarOutline />
          </button>
        ))}
      </div>

      {/* Rating Text & Review Count */}
      <div className="flex items-center space-x-1">
        <span className={`font-medium text-slate-700 ${textSizeClasses[size]}`}>
          {currentRating > 0 ? currentRating.toFixed(1) : 'New'}
        </span>
        {showCount && reviewCount > 0 && (
          <span className={`text-slate-500 ${textSizeClasses[size]}`}>
            ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
};

// Rating Input Component for forms
export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  size = 'md',
  disabled = false,
  required = false,
  label,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const currentRating = hoverRating || value;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`${sizeClasses[size]} transition-all ${
              disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110'
            } ${
              rating <= currentRating 
                ? 'text-amber-400' 
                : 'text-slate-300 hover:text-amber-300'
            }`}
            onClick={() => !disabled && onChange(rating)}
            onMouseEnter={() => !disabled && setHoverRating(rating)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            disabled={disabled}
          >
            {rating <= currentRating ? <StarSolid /> : <StarOutline />}
          </button>
        ))}
        
        <span className="ml-3 text-sm text-slate-600">
          {currentRating > 0 ? `${currentRating} star${currentRating !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      </div>
    </div>
  );
};

// Review Form Component
export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  services = [],
  maxLength = 500
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }

    if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters long';
    }

    if (comment.length > maxLength) {
      newErrors.comment = `Comment must be less than ${maxLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const selectedService = services.find(s => s.id === selectedServiceId);
    
    onSubmit({
      rating,
      comment: comment.trim(),
      serviceId: selectedServiceId,
      serviceName: selectedService?.name,
      isVerified: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <RatingInput
          value={rating}
          onChange={setRating}
          label="Your Rating"
          required
          size="lg"
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Service (Optional)
          </label>
          <select
            value={selectedServiceId || ''}
            onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">General review</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={maxLength}
          placeholder="Share your experience with this provider..."
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
            errors.comment ? 'border-red-300' : 'border-slate-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.comment ? (
            <p className="text-sm text-red-600">{errors.comment}</p>
          ) : (
            <div />
          )}
          <p className="text-xs text-slate-500">
            {comment.length}/{maxLength}
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
};

// Review List Component
export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  showServiceName = true,
  maxVisible,
  onLoadMore,
  loading = false,
  className = ''
}) => {
  const displayedReviews = maxVisible ? reviews.slice(0, maxVisible) : reviews;
  const hasMore = maxVisible && reviews.length > maxVisible;

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <StarOutline className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Reviews Yet</h3>
        <p className="text-slate-600">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {displayedReviews.map((review) => (
        <div key={review.id} className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
          <div className="flex items-start space-x-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {review.userAvatar ? (
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {review.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Review Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {review.userName}
                    {review.isVerified && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <RatingDisplay rating={review.rating} showCount={false} size="sm" />
                    <span className="text-xs text-slate-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {showServiceName && review.serviceName && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    {review.serviceName}
                  </span>
                </div>
              )}

              <p className="text-slate-700 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent mr-2 inline-block"></div>
                Loading...
              </>
            ) : (
              `Show ${Math.min(reviews.length - maxVisible, 5)} more reviews`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Rating Summary Component
export const RatingSummary: React.FC<{
  overallRating: number;
  reviewCount: number;
  ratingDistribution: Record<number, number>; // e.g., { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
  className?: string;
}> = ({ overallRating, reviewCount, ratingDistribution, className = '' }) => {
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <div className={`bg-white rounded-xl p-6 border border-slate-100 shadow-sm ${className}`}>
      <div className="text-center mb-6">
        <div className="text-4xl font-light text-slate-800 mb-2">
          {overallRating.toFixed(1)}
        </div>
        <RatingDisplay rating={overallRating} showCount={false} size="lg" />
        <p className="text-sm text-slate-600 mt-2">
          Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-16">
                <span className="text-sm text-slate-600">{rating}</span>
                <StarSolid className="h-3 w-3 text-amber-400" />
              </div>
              
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <span className="text-sm text-slate-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};