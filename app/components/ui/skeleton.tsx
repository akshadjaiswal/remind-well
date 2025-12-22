import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text';
}

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse-soft bg-gray-200 rounded',
        {
          'rounded-full': variant === 'circle',
          'h-4 rounded': variant === 'text',
        },
        className
      )}
      {...props}
    />
  );
}

// Composable skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
      <Skeleton variant="text" className="w-1/3 h-3" />
      <Skeleton variant="text" className="w-1/2 h-8" />
      <Skeleton variant="text" className="w-2/3 h-3" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-24 rounded-md" />;
}

export function SkeletonAvatar({ size = 'base' }: { size?: 'sm' | 'base' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    base: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return <Skeleton variant="circle" className={sizeClasses[size]} />;
}
