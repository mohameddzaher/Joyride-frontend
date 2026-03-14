'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiStar,
  HiOutlineStar,
  HiCheck,
  HiOutlineThumbUp,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiX,
} from 'react-icons/hi';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { Button, Input, Textarea, Card, Badge, RatingSummary, Rating } from '@/components/ui';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  averageRating?: number;
  reviewCount?: number;
  ratingDistribution?: Record<number, number>;
}

export function ProductReviews({
  productId,
  productTitle,
  averageRating = 0,
  reviewCount = 0,
  ratingDistribution = {},
}: ProductReviewsProps) {
  const { t } = useI18n();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  const userId = user?.id || user?._id;

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, page],
    queryFn: () => reviewsApi.getByProduct(productId, { page, limit: 10 }),
    enabled: !!productId,
  });

  // Check if user can review
  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', productId],
    queryFn: () => reviewsApi.canReview(productId),
    enabled: !!productId && isAuthenticated,
  });

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats;
  const pagination = reviewsData?.pagination;

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (data: { productId: string; orderId: string; rating: number; title?: string; comment: string }) =>
      reviewsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', productId] });
      // Invalidate product details to update reviewCount in tabs
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('reviews.reviewSubmitted'));
      setIsFormOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('reviews.failedSubmit'));
    },
  });

  // Update review mutation (own review)
  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: { rating?: number; title?: string; comment?: string } }) =>
      reviewsApi.update(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('reviews.reviewUpdated'));
      setEditingReview(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('reviews.failedUpdate'));
    },
  });

  // Delete own review mutation
  const deleteOwnReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteOwn(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('reviews.reviewDeleted'));
    },
    onError: () => toast.error(t('reviews.failedDelete')),
  });

  // Delete review mutation (super admin)
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('reviews.reviewDeleted'));
    },
    onError: () => toast.error(t('reviews.failedDelete')),
  });

  // Mark helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.markHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = (data: ReviewForm) => {
    if (editingReview) {
      updateReviewMutation.mutate({
        reviewId: editingReview._id,
        data: { rating: selectedRating, title: data.title, comment: data.comment },
      });
      return;
    }
    if (!canReviewData?.orderId) {
      toast.error(t('reviews.mustPurchase'));
      return;
    }
    createReviewMutation.mutate({
      productId,
      orderId: canReviewData.orderId,
      rating: selectedRating,
      title: data.title,
      comment: data.comment,
    });
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setSelectedRating(review.rating);
    reset({ title: review.title || '', comment: review.comment || '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    reset();
    setSelectedRating(5);
  };

  const canWriteReview = isAuthenticated && canReviewData?.canReview;

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <RatingSummary
            averageRating={stats?.averageRating || averageRating}
            totalReviews={stats?.totalReviews || reviewCount}
            distribution={stats?.distribution || ratingDistribution}
          />

          {/* Write Review Button */}
          {canWriteReview && (
            <Button
              className="mt-4 w-full"
              leftIcon={<HiOutlinePencilAlt size={18} />}
              onClick={() => setIsFormOpen(true)}
            >
              {t('reviews.writeReview')}
            </Button>
          )}

          {isAuthenticated && !canReviewData?.canReview && canReviewData?.reason && (
            <p className="mt-4 text-sm text-dark-500 text-center">
              {canReviewData.reason === 'Already reviewed'
                ? t('reviews.alreadyReviewed')
                : t('reviews.purchaseToReview')}
            </p>
          )}

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-dark-500 text-center">
              {t('reviews.signInToReview')}
            </p>
          )}
        </div>

        {/* Reviews List */}
        <div className="md:w-2/3 space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} padding="md" className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-beige-200"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-beige-200 rounded w-1/4"></div>
                    <div className="h-3 bg-beige-200 rounded w-1/3"></div>
                    <div className="h-16 bg-beige-200 rounded"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : reviews.length > 0 ? (
            <>
              {reviews.map((review: any) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card padding="md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary-600">
                            {(review.userName || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-dark-900">
                              {review.userName || 'Anonymous'}
                            </span>
                            {review.isVerifiedPurchase && (
                              <Badge variant="success" size="sm">
                                <HiCheck size={12} className="mr-1" />
                                {t('reviews.verified')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Rating value={review.rating} size="sm" />
                            <span className="text-xs text-dark-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit/Delete for own review or super admin */}
                      <div className="flex items-center gap-1">
                        {userId && review.userId === userId && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                              title={t('reviews.editReview')}
                            >
                              <HiOutlinePencilAlt size={16} className="text-dark-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(t('reviews.confirmDeleteOwn'))) {
                                  deleteOwnReviewMutation.mutate(review._id);
                                }
                              }}
                              title={t('reviews.deleteReview')}
                            >
                              <HiOutlineTrash size={16} className="text-red-500" />
                            </Button>
                          </>
                        )}
                        {isSuperAdmin && review.userId !== userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(t('reviews.confirmDeleteAdmin'))) {
                                deleteReviewMutation.mutate(review._id);
                              }
                            }}
                            title={t('reviews.deleteReviewAdmin')}
                          >
                            <HiOutlineTrash size={18} className="text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="mt-3 font-medium text-dark-900">{review.title}</h4>
                    )}

                    {review.comment && (
                      <p className="mt-2 text-dark-600 text-sm">{review.comment}</p>
                    )}

                    {/* Helpful button */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => markHelpfulMutation.mutate(review._id)}
                        className="flex items-center gap-1 text-sm text-dark-500 hover:text-primary-600 transition-colors"
                      >
                        <HiOutlineThumbUp size={16} />
                        <span>{t('reviews.helpful')} ({review.helpfulCount || 0})</span>
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-dark-500">
                    {t('reviews.page')} {page} {t('reviews.of')} {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineStar className="text-beige-400" size={32} />
              </div>
              <p className="text-dark-500">{t('reviews.noReviewsYet')}</p>
              {canWriteReview && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setIsFormOpen(true)}
                >
                  {t('reviews.beFirstToReview')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-50"
              onClick={handleCloseForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-dark-900">
                    {editingReview ? t('reviews.editYourReview') : t('reviews.writeReview')}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="p-2 text-dark-400 hover:text-dark-600 transition-colors"
                    title="Close"
                    aria-label="Close form"
                  >
                    <HiX size={20} />
                  </button>
                </div>

                <p className="text-sm text-dark-500 mb-4">
                  {editingReview ? t('reviews.editingReviewFor') : t('reviews.reviewing')}{' '}
                  <span className="font-medium text-dark-900">{productTitle}</span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">
                      {t('reviews.yourRating')}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setSelectedRating(rating)}
                          className="p-1 transition-transform hover:scale-110"
                          title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                          aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                        >
                          <HiStar
                            size={28}
                            className={rating <= selectedRating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label={t('reviews.reviewTitle')}
                    placeholder={t('reviews.reviewTitlePlaceholder')}
                    {...register('title')}
                  />

                  <Textarea
                    label={t('reviews.yourReview')}
                    placeholder={t('reviews.reviewPlaceholder')}
                    rows={4}
                    error={errors.comment?.message}
                    {...register('comment')}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={handleCloseForm}
                    >
                      {t('reviews.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={editingReview ? updateReviewMutation.isPending : createReviewMutation.isPending}
                    >
                      {editingReview ? t('reviews.updateReview') : t('reviews.submitReview')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductReviews;
