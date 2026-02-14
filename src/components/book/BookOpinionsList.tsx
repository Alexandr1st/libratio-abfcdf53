import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, User, MessageSquare } from "lucide-react";
import { useBookOpinions } from "@/hooks/useBookOpinions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface BookOpinionsListProps {
  bookId: string;
  currentUserId?: string;
}

const BookOpinionsList = ({ bookId, currentUserId }: BookOpinionsListProps) => {
  const { data: opinions, isLoading } = useBookOpinions(bookId);

  // Filter out current user's opinion (shown separately in MyOpinionBlock)
  const otherOpinions = (opinions || []).filter(
    (o) => o.userId !== currentUserId
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (otherOpinions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Мнения ({otherOpinions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {otherOpinions.map((opinion) => (
          <div key={opinion.id} className="border-b last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                {opinion.profile?.avatar_url ? (
                  <img
                    src={opinion.profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {opinion.profile?.full_name || opinion.profile?.username || "Пользователь"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(opinion.updatedAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (opinion.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {opinion.notes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BookOpinionsList;
