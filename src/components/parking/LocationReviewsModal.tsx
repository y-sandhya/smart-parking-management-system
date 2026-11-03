import React, { useEffect, useState } from 'react';
import { LocationReview, ParkingLocation, UserProfile } from '../../types';
import { api } from '../../services/api';
import {
  X,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface LocationReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: ParkingLocation;
  currentUser: UserProfile;
  onReviewAdded: (updatedLoc: Partial<ParkingLocation>) => void;
}

export const LocationReviewsModal: React.FC<LocationReviewsModalProps> = ({
  isOpen,
  onClose,
  location,
  currentUser,
  onReviewAdded,
}) => {
  if (!isOpen) return null;

  const [reviews, setReviews] = useState<LocationReview[]>(location.reviews || []);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableTags = [
    'Fast EV Charger',
    'Clean Facility',
    'Easy Navigation',
    'Spacious Bays',
    'Contactless Entry',
    'Helpful Staff',
    'Shuttle Service',
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const data = await api.getLocationReviews(location.id);
        if (isMounted && data.length > 0) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [location.id]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a short comment about your parking experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.addLocationReview(location.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      setReviews(prev => [res.review, ...prev]);
      onReviewAdded({
        rating: res.averageRating,
        reviewsCount: res.totalReviews,
      });

      setComment('');
      setSelectedTags([]);
      setSuccessMsg('Thank you! Your verified review has been posted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center text-amber-300">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(location.rating) ? 'fill-current' : 'opacity-40'
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-white text-sm">
              {location.rating.toFixed(1)} / 5.0
            </span>
            <span className="text-blue-100 text-xs">({reviews.length} reviews)</span>
          </div>

          <h2 className="text-xl font-black">{location.name}</h2>
          <p className="text-xs text-blue-100 mt-0.5 line-clamp-1">{location.address}</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add Review Form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Leave a Driver Review</span>
            </h4>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-current text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-slate-700">{rating} of 5 Stars</span>
                </div>
              </div>

              {/* Tag Badges */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Experience Highlights</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text area */}
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about parking availability, EV charging speed, lighting, or gate access..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Submit Review'}</span>
              </button>
            </form>
          </div>

          {/* Existing Reviews List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Recent Driver Reviews ({reviews.length})
            </h4>

            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              reviews.map(rev => (
                <div
                  key={rev.id}
                  className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          rev.userAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            rev.userName
                          )}&background=2563EB&color=fff`
                        }
                        alt={rev.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-current' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rev.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
