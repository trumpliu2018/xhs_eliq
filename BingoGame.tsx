import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getRoomParticipants,
  getTraits,
  getReceivedEvaluations,
  createInteraction,
  deleteInteraction,
  type BingoRoomParticipant,
  type BingoTrait,
  type ReceivedEvaluation,
  type BingoAchievement,
} from "@/services/bingo";
import { useUserStore } from "@/stores";
import { Loader2, Users, Award, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import {
  saveAchievements,
  loadAchievements,
  detectAchievementChanges,
  getAchievementDescription,
} from "@/lib/achievementStorage";

type GridCell = BingoTrait & { score: number; evaluated_by_me: boolean };

// 动态导入 MBTI 头像（/src/assets/avatar/*.png）
const avatarModules = import.meta.glob<{ default: string }>("@/assets/avatar/*.png", { eager: true });
const getMbtiAvatar = (mbtiType?: string) => {
  if (!mbtiType) return undefined;
  const target = `/${mbtiType.toLowerCase()}.png`;
  const entry = Object.entries(avatarModules).find(([path]) => path.endsWith(target));
  return entry?.[1]?.default;
};

// MBTI 类型颜色配置
interface MbtiColorConfig {
  headerBg: string;      // 标题栏背景
  borderBg: string;      // 网格外框背景
  borderColor: string;   // 格子边框颜色
  borderColorActive: string; // 已评价格子边框颜色
  textColor: string;     // 数字文字颜色
  scoreColors: string[]; // 根据评价数量的背景颜色数组（0-5+）
  highlightBg: string;   // 高亮背景颜色
  highlightBorder: string; // 高亮边框颜色
}

// 根据 MBTI 类型返回颜色配置
const getMbtiColors = (mbtiType?: string): MbtiColorConfig => {
  if (!mbtiType) {
    // 默认紫色
    return {
      headerBg: "bg-primary/80",
      borderBg: "bg-primary/10",
      borderColor: "border-primary/50",
      borderColorActive: "border-primary",
      textColor: "text-primary/80",
      scoreColors: [
        "bg-white",
        "bg-primary/10",
        "bg-primary/20",
        "bg-primary/30",
        "bg-primary/40",
        "bg-primary/50",
      ],
      highlightBg: "bg-primary/30",
      highlightBorder: "border-primary",
    };
  }
  
  const type = mbtiType.toUpperCase();
  
  // NT (Intuitive Thinking): INTJ, INTP, ENTJ, ENTP - 紫色
  if (["INTJ", "INTP", "ENTJ", "ENTP"].includes(type)) {
    return {
      headerBg: "bg-purple-500/80",
      borderBg: "bg-purple-500/10",
      borderColor: "border-purple-500/50",
      borderColorActive: "border-purple-500",
      textColor: "text-purple-500/80",
      scoreColors: [
        "bg-white",
        "bg-purple-500/10",
        "bg-purple-500/20",
        "bg-purple-500/30",
        "bg-purple-500/40",
        "bg-purple-500/50",
      ],
      highlightBg: "bg-purple-400/60",
      highlightBorder: "border-purple-400",
    };
  }
  
  // NF (Intuitive Feeling): INFJ, INFP, ENFJ, ENFP - 绿色
  if (["INFJ", "INFP", "ENFJ", "ENFP"].includes(type)) {
    return {
      headerBg: "bg-green-500/80",
      borderBg: "bg-green-500/10",
      borderColor: "border-green-500/50",
      borderColorActive: "border-green-500",
      textColor: "text-green-500/80",
      scoreColors: [
        "bg-white",
        "bg-green-500/10",
        "bg-green-500/20",
        "bg-green-500/30",
        "bg-green-500/40",
        "bg-green-500/50",
      ],
      highlightBg: "bg-green-400/60",
      highlightBorder: "border-green-400",
    };
  }
  
  // SJ (Sensing Judging): ISTJ, ISFJ, ESTJ, ESFJ - 蓝色
  if (["ISTJ", "ISFJ", "ESTJ", "ESFJ"].includes(type)) {
    return {
      headerBg: "bg-blue-500/80",
      borderBg: "bg-blue-500/10",
      borderColor: "border-blue-500/50",
      borderColorActive: "border-blue-500",
      textColor: "text-blue-500/80",
      scoreColors: [
        "bg-white",
        "bg-blue-500/10",
        "bg-blue-500/20",
        "bg-blue-500/30",
        "bg-blue-500/40",
        "bg-blue-500/50",
      ],
      highlightBg: "bg-blue-400/60",
      highlightBorder: "border-blue-400",
    };
  }
  
  // SP (Sensing Perceiving): ISTP, ISFP, ESTP, ESFP - 黄色
  if (["ISTP", "ISFP", "ESTP", "ESFP"].includes(type)) {
    return {
      headerBg: "bg-yellow-500/80",
      borderBg: "bg-yellow-500/10",
      borderColor: "border-yellow-500/50",
      borderColorActive: "border-yellow-500",
      textColor: "text-yellow-500/80",
      scoreColors: [
        "bg-white",
        "bg-yellow-500/10",
        "bg-yellow-500/20",
        "bg-yellow-500/30",
        "bg-yellow-500/40",
        "bg-yellow-500/50",
      ],
      highlightBg: "bg-yellow-400/60",
      highlightBorder: "border-yellow-400",
    };
  }
  
  // 默认紫色
  return {
    headerBg: "bg-primary/80",
    borderBg: "bg-primary/10",
    borderColor: "border-primary/50",
    borderColorActive: "border-primary",
    textColor: "text-primary/80",
    scoreColors: [
      "bg-white",
      "bg-primary/10",
      "bg-primary/20",
      "bg-primary/30",
      "bg-primary/40",
      "bg-primary/50",
    ],
    highlightBg: "bg-primary/30",
    highlightBorder: "border-primary",
  };
};

const BingoGame = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useUserStore();

  const roomCode = searchParams.get("room") || "";

  // 基本校验
  useEffect(() => {
    if (!roomCode) {
      toast({ 
        title: "缺少房间号", 
        description: "请返回并重新选择房间", 
        variant: "destructive",
        duration: 3000,
      });
      navigate("/");
    }
  }, [roomCode, toast, navigate]);

  // 参与者列表（轮询10秒）
  const {
    data: participantsData,
    isLoading: loadingParticipants,
    refetch: refetchParticipants,
  } = useQuery({
    queryKey: ["bingo-participants", roomCode],
    queryFn: () => getRoomParticipants(roomCode),
    enabled: !!roomCode,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });

  const roomId = participantsData?.participants?.[0]?.room_id;

  // 当前 target（被评价者）
  const [targetId, setTargetId] = useState<number | null>(null);
  
  // 本地存储的成就列表（用于检测变化）
  const storedAchievementsRef = useRef<BingoAchievement[]>([]);
  
  // 标记是否已经完成初始化（用于区分首次加载和后续更新）
  const isInitializedRef = useRef<boolean>(false);
  
  // 高亮动画的格子索引
  const [highlightedCells, setHighlightedCells] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (participantsData?.participants?.length) {
      // 默认选择第一个不是自己的用户；如果只有自己，就选自己
      const firstOther = participantsData.participants.find((p) => p.user_id.toString() !== user?.userId);
      setTargetId(firstOther?.user_id ?? participantsData.participants[0].user_id);
    }
  }, [participantsData, user?.userId]);

  const targetParticipant = useMemo(
    () => participantsData?.participants.find((p) => p.user_id === targetId),
    [participantsData, targetId]
  );
  // traits（依赖 target 的 MBTI）
  const targetMbti = targetParticipant?.mbti_type;
  const targetName =
    targetParticipant?.user?.nickname ||
    (targetParticipant ? `用户${targetParticipant.user_id}` : targetMbti || "MBTI");
  const targetAvatar = useMemo(() => getMbtiAvatar(targetMbti), [targetMbti]);
  const mbtiColors = useMemo(() => getMbtiColors(targetMbti), [targetMbti]);
  const {
    data: traitsData,
    isLoading: loadingTraits,
  } = useQuery({
    queryKey: ["bingo-traits", targetMbti],
    queryFn: () => getTraits(targetMbti!),
    enabled: !!targetMbti,
  });

  // 收到的评价（score）轮询（5秒）
  const {
    data: receivedData,
    isLoading: loadingReceived,
    refetch: refetchReceived,
  } = useQuery({
    queryKey: ["bingo-received", roomId, targetId],
    queryFn: () => getReceivedEvaluations(roomId!, targetId!),
    enabled: !!roomId && !!targetId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });

  // 获取成就对应的格子位置（position 从 1 开始）
  const getAchievementCellPositions = (achievement: BingoAchievement): number[] => {
    const { achievement_type, line_index } = achievement;
    
    if (achievement_type === 'row') {
      // 横线：第 line_index 行的 5 个格子
      const startPos = line_index * 5 + 1;
      return [startPos, startPos + 1, startPos + 2, startPos + 3, startPos + 4];
    } else if (achievement_type === 'col') {
      // 竖线：第 line_index 列的 5 个格子
      const startPos = line_index + 1;
      return [startPos, startPos + 5, startPos + 10, startPos + 15, startPos + 20];
    } else if (achievement_type === 'diagonal') {
      if (line_index === 0) {
        // 主对角线：position 1,7,13,19,25
        return [1, 7, 13, 19, 25];
      } else {
        // 副对角线：position 5,9,13,17,21
        return [5, 9, 13, 17, 21];
      }
    }
    return [];
  };

  // 逐个高亮格子的动画
  const animateAchievement = async (achievement: BingoAchievement): Promise<void> => {
    const positions = getAchievementCellPositions(achievement);
    
    // 逐个高亮格子，增加延迟时间
    for (let i = 0; i < positions.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)); // 从 150ms 增加到 300ms
      setHighlightedCells(prev => new Set([...prev, positions[i]]));
    }
    
    // 所有格子高亮后，闪烁效果
    await new Promise(resolve => setTimeout(resolve, 500)); // 从 300ms 增加到 500ms
    setHighlightedCells(new Set());
    await new Promise(resolve => setTimeout(resolve, 200)); // 从 100ms 增加到 200ms
    setHighlightedCells(new Set(positions));
    await new Promise(resolve => setTimeout(resolve, 400)); // 从 200ms 增加到 400ms
    
    // 清除高亮
    setHighlightedCells(new Set());
  };

  // 触发粒子特效
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // 当切换参与者时，重置存储的成就基准和初始化标记
  useEffect(() => {
    if (roomId && targetId) {
      // 从本地存储加载该用户的成就作为基准
      const stored = loadAchievements(roomId, targetId);
      storedAchievementsRef.current = stored;
      // 重置初始化标记，表示需要重新初始化
      isInitializedRef.current = false;
    }
  }, [roomId, targetId]);

  // 监测成就变化
  useEffect(() => {
    if (!roomId || !targetId || !receivedData?.achievements) return;

    const newAchievements = receivedData.achievements;
    const oldAchievements = storedAchievementsRef.current;
    
    // 首次初始化：直接设置为基准，不触发任何提示
    if (!isInitializedRef.current) {
      storedAchievementsRef.current = newAchievements;
      saveAchievements(roomId, targetId, newAchievements);
      isInitializedRef.current = true;
      return;
    }

    // 检测变化
    const { added } = detectAchievementChanges(
      oldAchievements,
      newAchievements
    );

    // 新增成就：显示特效和提示
    if (added.length > 0) {
      // 异步执行动画
      (async () => {
        for (const achievement of added) {
          // 显示 Toast
          const description = getAchievementDescription(achievement);
          toast({
            title: "🎉 达成 Bingo！",
            description,
            duration: 5000,
          });
          
          // 播放扫描动画
          await animateAchievement(achievement);
        }
        
        // 所有动画完成后触发烟花
        triggerConfetti();
      })();
    }

    // 更新本地存储和引用（无论是新增还是减少都要更新）
    if (JSON.stringify(oldAchievements) !== JSON.stringify(newAchievements)) {
      saveAchievements(roomId, targetId, newAchievements);
      storedAchievementsRef.current = newAchievements;
    }
  }, [receivedData?.achievements, roomId, targetId, toast]);

  // 评价/取消评价（根据 evaluated_by_me 决定是删除还是创建）
  const evaluateMutation = useMutation({
    mutationFn: async ({ traitId, evaluatedByMe }: { traitId: number; evaluatedByMe: boolean }) => {
      if (!roomId || !targetId) {
        throw new Error("房间或目标用户未就绪，请稍后重试");
      }
      // 调试日志
      if (import.meta.env.DEV) {
        console.log('🔍 评价操作:', { traitId, evaluatedByMe, roomId, targetId });
      }
      if (evaluatedByMe) {
        // 已评价过，执行删除
        if (import.meta.env.DEV) {
          console.log('🗑️ 执行 DELETE 请求');
        }
        await deleteInteraction({ room_id: roomId, target_id: targetId, trait_id: traitId });
        return { status: "deleted" as const };
      } else {
        // 未评价过，执行创建
        if (import.meta.env.DEV) {
          console.log('➕ 执行 POST 请求');
        }
        await createInteraction({ room_id: roomId, target_id: targetId, trait_id: traitId });
        return { status: "created" as const };
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["bingo-received", roomId, targetId] });
    },
    onError: (error: any) => {
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // 构建 5x5 Grid 数据，按 position 排序并附加 score 和 evaluated_by_me
  const { gridCells, mbtiIntro } = useMemo(() => {
    const traits = traitsData?.traits || [];
    const intro = traits[0]?.trait_text || "";
    const rest = traits.slice(1); // 后续 25 条为评价列表
    const evaluationMap = new Map<number, { score: number; evaluated_by_me: boolean }>();
    const currentUserId = user?.userId ? parseInt(user.userId, 10) : null;
    receivedData?.evaluations?.forEach((ev) => {
      // 如果 API 返回了 evaluated_by_me，直接使用；否则通过 evaluators 列表判断
      let evaluatedByMe = ev.evaluated_by_me;
      if (evaluatedByMe === undefined && currentUserId !== null && ev.evaluators) {
        evaluatedByMe = ev.evaluators.some((evaluator) => evaluator.user_id === currentUserId);
      }
      evaluationMap.set(ev.trait_id, {
        score: ev.score,
        evaluated_by_me: evaluatedByMe ?? false,
      });
    });
    const cells = rest
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((t) => {
        const evalData = evaluationMap.get(t.id);
        return {
          ...t,
          score: evalData?.score || 0,
          evaluated_by_me: evalData?.evaluated_by_me || false,
        };
      });
    return { gridCells: cells, mbtiIntro: intro };
  }, [traitsData, receivedData]);

  const isLoading = loadingParticipants || loadingTraits || loadingReceived;

  // 根据评价数量返回背景颜色（0-5，超过5保持最深）
  const getScoreClass = (score: number) => {
    const maxScore = 5; // 超过5人后不再变化
    const clampedScore = Math.min(score, maxScore);
    const idx = Math.min(mbtiColors.scoreColors.length - 1, clampedScore);
    return mbtiColors.scoreColors[idx];
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <div className="container-narrow py-16 text-center space-y-4">
            <h1 className="text-3xl font-display font-semibold">需要登录</h1>
            <p className="text-muted-foreground">请先登录后再加入或进入房间</p>
            <Button onClick={() => navigate("/login")}>去登录</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Bingo 主打移动端：减少左右留白，让 5x5 尽量铺满 */}
        <div className="mx-auto max-w-7xl px-1 sm:px-4 py-4 sm:py-8 lg:py-10">

          <div className="grid lg:grid-cols-[250px,1fr] gap-2 sm:gap-3">
            {/* 参与者列表 */}
              <Card className="h-fit border border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-4 h-4" />
                  参与者
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-2">
                {loadingParticipants && (
                  <div className="text-muted-foreground text-sm">加载中...</div>
                )}
                {!loadingParticipants && participantsData?.participants?.length === 0 && (
                  <div className="text-muted-foreground text-sm">暂无参与者</div>
                )}
                  <div className="grid grid-cols-5 lg:grid-cols-3 gap-1">
                  {participantsData?.participants.map((p) => {
                    const isTarget = p.user_id === targetId;
                    return (
                      <button
                        key={p.user_id}
                        onClick={() => setTargetId(p.user_id)}
                        className={cn(
                            "flex flex-col items-center gap-0.5 rounded border px-1 py-1 text-center transition-colors bg-white shadow-xs max-w-[82px] w-full mx-auto",
                            isTarget ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/50 hover:bg-muted/15"
                        )}
                      >
                          <div className="text-[11px] sm:text-[12px] font-medium truncate max-w-full">
                            {p.user?.nickname || `用户${p.user_id}`}
                          </div>
                          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                            <AvatarImage src={getMbtiAvatar(p.mbti_type) || p.user?.avatar} alt={p.user?.nickname} />
                          <AvatarFallback>{p.user?.nickname?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 主区域：网格与成就 */}
            <div className="space-y-2">
              {/* 评价主体：不再使用 <Card>，避免默认圆角/边框/内边距占用空间 */}
              <div className="overflow-hidden rounded-xl bg-white shadow-sm p-1 sm:p-2">
                {/* 标题条（根据MBTI类型显示不同颜色） */}
                <div className={`${mbtiColors.headerBg} text-white px-3 sm:px-5 py-4 flex items-start gap-2 sm:gap-3`}>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display font-semibold text-2xl sm:text-3xl md:text-4xl tracking-wide truncate">
                      {targetName ? `${targetName}的Bingo游戏` : "Bingo游戏"}
                    </h1>
                    <p className="mt-3 text-base sm:text-lg md:text-xl font-semibold leading-snug">
                      五个连成一条线，你就是一只 {mbtiIntro || "（加载中）"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center relative z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-sm bg-transparent border-none">
                      {targetAvatar ? (
                        <img src={targetAvatar} alt={targetMbti || "MBTI"} className="w-full h-full object-cover scale-150 rounded-sm" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold bg-transparent">
                          {targetMbti || "MBTI"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 外框 + 5x5（参考设计图：紫色粗边，格子紧凑铺满） */}
                <div className="p-0">
                  {isLoading && (
                    <div className="p-3 flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>加载中...</span>
                    </div>
                  )}

                  {!isLoading && gridCells.length > 0 && (
                    <div className={`${mbtiColors.borderBg} p-[2px] sm:p-1`}>
                      <div className="grid grid-cols-5 gap-[2px] sm:gap-[3px]">
                        {gridCells.map((cell) => {
                          const isHighlighted = highlightedCells.has(cell.position);
                          return (
                            <button
                              key={cell.id}
                              onClick={() => {
                                // 调试日志
                                if (import.meta.env.DEV) {
                                  console.log('🖱️ 点击格子:', {
                                    traitId: cell.id,
                                    traitText: cell.trait_text,
                                    evaluated_by_me: cell.evaluated_by_me,
                                    score: cell.score,
                                  });
                                }
                                evaluateMutation.mutate({
                                  traitId: cell.id,
                                  evaluatedByMe: cell.evaluated_by_me,
                                });
                              }}
                              disabled={evaluateMutation.isPending}
                              className={cn(
                                "relative aspect-square rounded text-center border transition-all duration-300 active:scale-[0.985] hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isHighlighted ? mbtiColors.highlightBg : getScoreClass(cell.score),
                                cell.evaluated_by_me
                                  ? `${mbtiColors.borderColorActive} border-2 shadow-sm`
                                  : `${mbtiColors.borderColor} shadow-xs`,
                                isHighlighted && `${mbtiColors.highlightBorder} border-[3px] scale-105 shadow-xl z-10 animate-pulse`
                              )}
                            >
                            <div className="text-[13px] sm:text-sm md:text-base font-semibold leading-snug text-foreground px-[1px] line-clamp-3">
                              {cell.trait_text}
                            </div>
                            <div className={`absolute bottom-[1px] right-[1px] text-[10px] sm:text-[11px] font-mono ${mbtiColors.textColor}`}>
                              {cell.score}
                            </div>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="flex flex-col gap-2 p-3 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <CardTitle>成就 / Bingo</CardTitle>
                  </div>
                  <CardDescription>当某行/列/斜线全部被评价时达成 Bingo</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-5 sm:pt-0">
                  {!receivedData?.achievements || receivedData.achievements.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      <p>暂无成就</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {receivedData.achievements.map((achievement) => {
                        const { achievement_type, line_index } = achievement;
                        return (
                          <div
                            key={`${achievement_type}-${line_index}`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20"
                          >
                            <Award className="w-5 h-5 text-primary flex-shrink-0" />
                            {achievement_type === 'row' && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-0.5 bg-primary rounded-full" />
                                <span className="text-xs font-semibold text-primary">{line_index + 1}</span>
                              </div>
                            )}
                            {achievement_type === 'col' && (
                              <div className="flex items-center gap-1">
                                <div className="w-0.5 h-5 bg-primary rounded-full" />
                                <span className="text-xs font-semibold text-primary">{line_index + 1}</span>
                              </div>
                            )}
                            {achievement_type === 'diagonal' && line_index === 0 && (
                              <div className="w-5 h-0.5 bg-primary rounded-full transform rotate-45" />
                            )}
                            {achievement_type === 'diagonal' && line_index === 1 && (
                              <div className="w-5 h-0.5 bg-primary rounded-full transform -rotate-45" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default BingoGame;

