import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ClubPollProps {
  clubId: string;
}

const ClubPoll = ({ clubId }: ClubPollProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch active poll
  const { data: poll } = useQuery({
    queryKey: ["club-poll", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_polls" as any)
        .select("*")
        .eq("club_id", clubId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!clubId,
  });

  // Fetch poll options with book info
  const { data: options = [] } = useQuery({
    queryKey: ["club-poll-options", poll?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_poll_options" as any)
        .select("*, books(*)")
        .eq("poll_id", poll.id);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!poll?.id,
  });

  // Fetch all votes for this poll
  const { data: votes = [] } = useQuery({
    queryKey: ["club-poll-votes", poll?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_poll_votes" as any)
        .select("*")
        .eq("poll_id", poll.id);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!poll?.id,
  });

  const userVote = votes.find((v: any) => v.user_id === user?.id);
  const hasVoted = !!userVote;
  const totalVotes = votes.length;

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase
        .from("club_poll_votes" as any)
        .insert({ poll_id: poll.id, option_id: optionId, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes", poll?.id] });
      setSelectedOption(null);
      toast({ title: "Голос учтён!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось проголосовать", variant: "destructive" });
    },
  });

  const retractMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("club_poll_votes" as any)
        .delete()
        .eq("poll_id", poll.id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes", poll?.id] });
      toast({ title: "Голос отменён" });
    },
  });

  if (!poll || options.length === 0) return null;

  const getVoteCount = (optionId: string) => votes.filter((v: any) => v.option_id === optionId).length;
  const getPercentage = (optionId: string) => totalVotes === 0 ? 0 : Math.round((getVoteCount(optionId) / totalVotes) * 100);

  return (
    <Card className="border-0 shadow-lg mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Vote className="h-4 w-4" />
          {poll.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((option: any) => {
          const book = option.books;
          const isSelected = selectedOption === option.id;
          const isUserVote = userVote?.option_id === option.id;
          const percentage = getPercentage(option.id);
          const count = getVoteCount(option.id);

          return (
            <div key={option.id} className="relative">
              {hasVoted ? (
                // Results view
                <div className="relative rounded-lg border border-border overflow-hidden p-3">
                  <div
                    className="absolute inset-0 bg-primary/10 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUserVote && <Check className="h-4 w-4 text-primary" />}
                      <span className={cn("text-sm", isUserVote && "font-semibold")}>
                        {book?.title} — {book?.author}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium ml-2 shrink-0">
                      {percentage}%
                    </span>
                  </div>
                </div>
              ) : (
                // Voting view
                <button
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                        isSelected ? "border-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm">
                      {book?.title} — {book?.author}
                    </span>
                  </div>
                </button>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          {!hasVoted ? (
            <Button
              onClick={() => selectedOption && voteMutation.mutate(selectedOption)}
              disabled={!selectedOption || voteMutation.isPending}
              variant="ghost"
              className="font-medium"
            >
              ГОЛОСОВАТЬ
            </Button>
          ) : (
            <Button
              onClick={() => retractMutation.mutate()}
              disabled={retractMutation.isPending}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Отменить голос
            </Button>
          )}
          {totalVotes > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalVotes} {totalVotes === 1 ? "голос" : totalVotes < 5 ? "голоса" : "голосов"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubPoll;
