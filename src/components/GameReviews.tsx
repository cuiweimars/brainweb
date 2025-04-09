import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Review {
  id: string;
  gameId: string;
  rating: number;
  comment: string;
  username: string;
  date: string;
}

interface GameReviewsProps {
  gameId: string;
}

const GameReviews: React.FC<GameReviewsProps> = ({ gameId }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 加载评论
  useEffect(() => {
    loadReviews();
  }, [gameId]);

  // 从localStorage加载评论
  const loadReviews = () => {
    try {
      const storedReviews = localStorage.getItem('gameReviews');
      if (storedReviews) {
        const allReviews: Review[] = JSON.parse(storedReviews);
        // 过滤出当前游戏的评论
        const gameReviews = allReviews.filter(review => review.gameId === gameId);
        // 按日期排序，最新的在前面
        gameReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReviews(gameReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  // 提交评论
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setErrorMessage(t('please_enter_username'));
      return;
    }

    if (!comment.trim()) {
      setErrorMessage(t('please_enter_comment'));
      return;
    }

    try {
      // 创建新评论
      const newReview: Review = {
        id: Date.now().toString(),
        gameId,
        rating,
        comment,
        username,
        date: new Date().toISOString()
      };

      // 获取现有评论
      const storedReviews = localStorage.getItem('gameReviews');
      let allReviews: Review[] = [];
      if (storedReviews) {
        allReviews = JSON.parse(storedReviews);
      }

      // 添加新评论
      allReviews.push(newReview);
      
      // 保存回localStorage
      localStorage.setItem('gameReviews', JSON.stringify(allReviews));
      
      // 刷新评论列表
      loadReviews();
      
      // 重置表单
      setUsername('');
      setRating(5);
      setComment('');
      setShowForm(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error saving review:', error);
      setErrorMessage(t('error_saving_review'));
    }
  };

  // 计算平均评分
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // 渲染星级评分
  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            } text-xl focus:outline-none`}
            disabled={!interactive}
            aria-label={interactive ? `Rate ${star} stars` : `Rated ${rating} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('player_reviews')}
          {reviews.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({reviews.length})
            </span>
          )}
        </h3>
        <div className="flex items-center">
          {reviews.length > 0 && (
            <div className="flex items-center mr-4">
              <div className="flex mr-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            {t('write_review')}
          </button>
        </div>
      </div>

      {/* 评论表单 */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-md">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t('your_review')}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('your_name')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('enter_username')}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('your_rating')}
              </label>
              <div className="flex items-center">
                {renderStars(rating, true)}
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {rating}/5
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('your_comment')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t('enter_comment')}
              />
            </div>
            {errorMessage && (
              <div className="mb-4 text-red-500">
                {errorMessage}
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                {t('submit_review')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 评论列表 */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-800 dark:text-indigo-200 font-semibold mr-3">
                    {review.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {review.username}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(review.date)}
                </span>
              </div>
              <div className="mb-2">
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('no_reviews_yet')}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
          >
            {t('be_the_first_reviewer')}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameReviews; 