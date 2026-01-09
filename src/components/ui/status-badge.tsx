import { cn } from '@/lib/utils';

type Status = 'active' | 'completed' | 'cancelled' | 'draft' | 'sent' | 'paid' | 'overdue';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  active: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
      statusStyles[status],
      className
    )}>
      {status}
    </span>
  );
}
