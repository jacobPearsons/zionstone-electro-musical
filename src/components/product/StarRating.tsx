import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRating({ 
  rating, 
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount 
}: StarRatingProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.round(rating);
    const isHalf = !isFilled && i - 0.5 <= rating;

    stars.push(
      <Star
        key={i}
        className={`${sizes[size]} ${
          isFilled 
            ? 'fill-yellow-400 text-yellow-400' 
            : isHalf
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-gray-300'
        }`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}

interface ReviewSummaryProps {
  totalReviews: number;
  averageRating: number;
  breakdown: Record<number, number>;
}

export function ReviewSummary({ totalReviews, averageRating, breakdown }: ReviewSummaryProps) {
  const maxCount = Math.max(...Object.values(breakdown));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <StarRating rating={averageRating} size="sm" />
          <p className="text-sm text-muted-foreground mt-1">
            {totalReviews.toLocaleString()} reviews
          </p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = breakdown[stars] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-6">{stars}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}