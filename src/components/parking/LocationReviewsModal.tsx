import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ParkingLocation, LocationReview, UserProfile } from '../../types';
import {
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Tag,
  User,
  Plus
} from 'lucide-react';

interface LocationReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: ParkingLocation | null;
  currentUser: UserProfile;
  onReviewAdded?: (updatedLocation: Partial<ParkingLocation>) => void;
}

export const LocationReviewsModal: React.FC<LocationReviewsModalProps> = ({
  isOpen,
  onClose,
  location,
  currentUser,
  onReviewAdded,
}) => {
  if (!isOpen || !location) return null;

  const [reviews, setReviews] = useState<LocationReview[]>(location.reviews || []);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Spacious Bays']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const availableTags = [
    'Fast EV Charger',
    'Spacious Bays',
    'Clean & Well-lit',
    'Seamless QR Gate',
    'Easy Navigation',
    'Safe & Secure',
    'Great Location',
  ];

  useEffect(() => {
    fetchReviews();
  }, [location.id]);

  const fetchReviews = async () => {
    try {
      const res = await api.getLocationReviews(location.id);
      setReviews(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
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
      setComment('');
      setShowAddForm(false);
      if (onReviewAdded) {
        onReviewAdded({
          rating: res.averageRating,
          reviewsCount: res.totalReviews,
        });
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight">{location.name}</h3>
              <span className="text-[10px] font-bold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-slate-950" />
                {location.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Community Reviews & Driver Feedback</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rating Summary Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black text-slate-900">
              {location.rating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(location.rating) ? 'fill-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Based on {reviews.length} driver ratings
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* New Review Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleSubmitReview} className="p-5 bg-blue-50/50 border-b border-blue-100 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Your Rating:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tag Badges */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">What did you like?</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about gate clearance, lighting, EV charging speed, etc..."
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {reviews.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No reviews yet. Be the first driver to leave feedback for this facility!
            </div>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {rev.userAvatar ? (
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {rev.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
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
  );
};
