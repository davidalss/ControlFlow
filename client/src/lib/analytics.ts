// Sistema de Analytics e Relatórios de Progresso e Desempenho
export interface TrainingProgress {
  userId: string;
  trainingId: string;
  trainingTitle: string;
  progress: number; // 0-100
  timeSpent: number; // em minutos
  lastAccessed: Date;
  completedAt?: Date;
  score?: number;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  modules: {
    id: string;
    title: string;
    progress: number;
    timeSpent: number;
    completed: boolean;
  }[];
}

export interface UserPerformance {
  userId: string;
  totalTrainings: number;
  completedTrainings: number;
  averageScore: number;
  totalTimeSpent: number;
  certificatesEarned: number;
  streakDays: number;
  lastActivity: Date;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'training' | 'performance' | 'engagement' | 'special';
}

export interface WeeklyProgress {
  week: string; // YYYY-WW
  trainingsStarted: number;
  trainingsCompleted: number;
  timeSpent: number;
  averageScore: number;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  trainingsStarted: number;
  trainingsCompleted: number;
  timeSpent: number;
  averageScore: number;
  certificatesEarned: number;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTrainings: number;
  totalCompletions: number;
  averageCompletionRate: number;
  averageScore: number;
  popularTrainings: PopularTraining[];
  userEngagement: UserEngagement[];
  completionTrends: CompletionTrend[];
}

export interface PopularTraining {
  trainingId: string;
  title: string;
  enrollments: number;
  completions: number;
  averageScore: number;
  averageTimeSpent: number;
}

export interface UserEngagement {
  userId: string;
  name: string;
  email: string;
  totalTimeSpent: number;
  trainingsCompleted: number;
  averageScore: number;
  lastActivity: Date;
  engagementScore: number; // 0-100
}

export interface CompletionTrend {
  date: string;
  completions: number;
  newEnrollments: number;
  averageScore: number;
}

class AnalyticsService {
  private progressData: TrainingProgress[] = [];
  private performanceData: UserPerformance[] = [];
  private analyticsData: AnalyticsData | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProgress = localStorage.getItem('trainingProgress');
      if (storedProgress) {
        this.progressData = JSON.parse(storedProgress).map((p: any) => ({
          ...p,
          lastAccessed: new Date(p.lastAccessed),
          completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
        }));
      }

      const storedPerformance = localStorage.getItem('userPerformance');
      if (storedPerformance) {
        this.performanceData = JSON.parse(storedPerformance).map((p: any) => ({
          ...p,
          lastActivity: new Date(p.lastActivity),
          achievements: p.achievements.map((a: any) => ({
            ...a,
            earnedAt: new Date(a.earnedAt),
          })),
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('trainingProgress', JSON.stringify(this.progressData));
      localStorage.setItem('userPerformance', JSON.stringify(this.performanceData));
    } catch (error) {
      console.error('Erro ao salvar dados de analytics:', error);
    }
  }

  // Tracking de Progresso
  trackProgress(progress: Partial<TrainingProgress>) {
    const userId = this.getCurrentUserId();
    const existingIndex = this.progressData.findIndex(
      p => p.userId === userId && p.trainingId === progress.trainingId
    );

    const progressData: TrainingProgress = {
      userId,
      trainingId: progress.trainingId!,
      trainingTitle: progress.trainingTitle!,
      progress: progress.progress || 0,
      timeSpent: progress.timeSpent || 0,
      lastAccessed: new Date(),
      completedAt: progress.completedAt,
      score: progress.score,
      attempts: progress.attempts || 0,
      status: progress.status || 'not_started',
      modules: progress.modules || [],
    };

    if (existingIndex >= 0) {
      this.progressData[existingIndex] = progressData;
    } else {
      this.progressData.push(progressData);
    }

    this.saveToStorage();
    this.updateUserPerformance(userId);
  }

  // Tracking de Módulo
  trackModuleProgress(
    trainingId: string,
    moduleId: string,
    moduleTitle: string,
    progress: number,
    timeSpent: number,
    completed: boolean
  ) {
    const userId = this.getCurrentUserId();
    const trainingProgress = this.progressData.find(
      p => p.userId === userId && p.trainingId === trainingId
    );

    if (trainingProgress) {
      const moduleIndex = trainingProgress.modules.findIndex(m => m.id === moduleId);
      const moduleData = {
        id: moduleId,
        title: moduleTitle,
        progress,
        timeSpent,
        completed,
      };

      if (moduleIndex >= 0) {
        trainingProgress.modules[moduleIndex] = moduleData;
      } else {
        trainingProgress.modules.push(moduleData);
      }

      // Calcular progresso geral do treinamento
      const totalModules = trainingProgress.modules.length;
      const completedModules = trainingProgress.modules.filter(m => m.completed).length;
      trainingProgress.progress = Math.round((completedModules / totalModules) * 100);

      if (trainingProgress.progress === 100) {
        trainingProgress.status = 'completed';
        trainingProgress.completedAt = new Date();
      } else if (trainingProgress.progress > 0) {
        trainingProgress.status = 'in_progress';
      }

      trainingProgress.lastAccessed = new Date();
      this.saveToStorage();
      this.updateUserPerformance(userId);
    }
  }

  // Tracking de Teste
  trackTestResult(
    trainingId: string,
    score: number,
    attempts: number,
    timeSpent: number
  ) {
    const userId = this.getCurrentUserId();
    const trainingProgress = this.progressData.find(
      p => p.userId === userId && p.trainingId === trainingId
    );

    if (trainingProgress) {
      trainingProgress.score = score;
      trainingProgress.attempts = attempts;
      trainingProgress.timeSpent += timeSpent;
      trainingProgress.lastAccessed = new Date();

      if (score >= 70) { // Nota mínima para aprovação
        trainingProgress.status = 'completed';
        trainingProgress.completedAt = new Date();
      } else {
        trainingProgress.status = 'failed';
      }

      this.saveToStorage();
      this.updateUserPerformance(userId);
    }
  }

  // Atualizar Performance do Usuário
  private updateUserPerformance(userId: string) {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    const completedTrainings = userProgress.filter(p => p.status === 'completed');
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageScore = completedTrainings.length > 0
      ? completedTrainings.reduce((sum, p) => sum + (p.score || 0), 0) / completedTrainings.length
      : 0;

    const existingPerformance = this.performanceData.find(p => p.userId === userId);
    const performance: UserPerformance = {
      userId,
      totalTrainings: userProgress.length,
      completedTrainings: completedTrainings.length,
      averageScore: Math.round(averageScore * 10) / 10,
      totalTimeSpent,
      certificatesEarned: completedTrainings.length,
      streakDays: this.calculateStreakDays(userId),
      lastActivity: new Date(),
      achievements: existingPerformance?.achievements || [],
      weeklyProgress: this.calculateWeeklyProgress(userId),
      monthlyProgress: this.calculateMonthlyProgress(userId),
    };

    if (existingPerformance) {
      const index = this.performanceData.indexOf(existingPerformance);
      this.performanceData[index] = performance;
    } else {
      this.performanceData.push(performance);
    }

    this.saveToStorage();
    this.checkAchievements(userId, performance);
  }

  // Calcular Dias de Sequência
  private calculateStreakDays(userId: string): number {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    const sortedDates = userProgress
      .map(p => p.lastAccessed)
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i]);
      currentDate.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(sortedDates[i + 1]);
      nextDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calcular Progresso Semanal
  private calculateWeeklyProgress(userId: string): WeeklyProgress[] {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    const weeklyData: { [key: string]: WeeklyProgress } = {};

    userProgress.forEach(progress => {
      const week = this.getWeekString(progress.lastAccessed);
      
      if (!weeklyData[week]) {
        weeklyData[week] = {
          week,
          trainingsStarted: 0,
          trainingsCompleted: 0,
          timeSpent: 0,
          averageScore: 0,
        };
      }

      weeklyData[week].trainingsStarted++;
      weeklyData[week].timeSpent += progress.timeSpent;

      if (progress.status === 'completed') {
        weeklyData[week].trainingsCompleted++;
        if (progress.score) {
          weeklyData[week].averageScore = 
            (weeklyData[week].averageScore + progress.score) / 2;
        }
      }
    });

    return Object.values(weeklyData).sort((a, b) => b.week.localeCompare(a.week));
  }

  // Calcular Progresso Mensal
  private calculateMonthlyProgress(userId: string): MonthlyProgress[] {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    const monthlyData: { [key: string]: MonthlyProgress } = {};

    userProgress.forEach(progress => {
      const month = this.getMonthString(progress.lastAccessed);
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          trainingsStarted: 0,
          trainingsCompleted: 0,
          timeSpent: 0,
          averageScore: 0,
          certificatesEarned: 0,
        };
      }

      monthlyData[month].trainingsStarted++;
      monthlyData[month].timeSpent += progress.timeSpent;

      if (progress.status === 'completed') {
        monthlyData[month].trainingsCompleted++;
        monthlyData[month].certificatesEarned++;
        if (progress.score) {
          monthlyData[month].averageScore = 
            (monthlyData[month].averageScore + progress.score) / 2;
        }
      }
    });

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  }

  // Verificar Conquistas
  private checkAchievements(userId: string, performance: UserPerformance) {
    const achievements: Achievement[] = [];

    // Primeiro treinamento
    if (performance.completedTrainings === 1) {
      achievements.push({
        id: 'first-training',
        title: 'Primeiro Passo',
        description: 'Completou seu primeiro treinamento',
        icon: '🎯',
        earnedAt: new Date(),
        category: 'training',
      });
    }

    // 5 treinamentos
    if (performance.completedTrainings === 5) {
      achievements.push({
        id: 'five-trainings',
        title: 'Aprendiz Dedicado',
        description: 'Completou 5 treinamentos',
        icon: '📚',
        earnedAt: new Date(),
        category: 'training',
      });
    }

    // 10 treinamentos
    if (performance.completedTrainings === 10) {
      achievements.push({
        id: 'ten-trainings',
        title: 'Especialista',
        description: 'Completou 10 treinamentos',
        icon: '🏆',
        earnedAt: new Date(),
        category: 'training',
      });
    }

    // Streak de 7 dias
    if (performance.streakDays >= 7) {
      achievements.push({
        id: 'week-streak',
        title: 'Consistente',
        description: 'Manteve atividade por 7 dias consecutivos',
        icon: '🔥',
        earnedAt: new Date(),
        category: 'engagement',
      });
    }

    // Alta pontuação
    if (performance.averageScore >= 90) {
      achievements.push({
        id: 'high-scorer',
        title: 'Excelência',
        description: 'Manteve média de 90% ou superior',
        icon: '⭐',
        earnedAt: new Date(),
        category: 'performance',
      });
    }

    // Adicionar novas conquistas
    achievements.forEach(achievement => {
      const existing = performance.achievements.find(a => a.id === achievement.id);
      if (!existing) {
        performance.achievements.push(achievement);
      }
    });

    this.saveToStorage();
  }

  // Obter Dados de Performance
  getUserPerformance(userId?: string): UserPerformance | null {
    const targetUserId = userId || this.getCurrentUserId();
    return this.performanceData.find(p => p.userId === targetUserId) || null;
  }

  // Obter Progresso de Treinamento
  getTrainingProgress(trainingId: string, userId?: string): TrainingProgress | null {
    const targetUserId = userId || this.getCurrentUserId();
    return this.progressData.find(
      p => p.userId === targetUserId && p.trainingId === trainingId
    ) || null;
  }

  // Obter Todos os Progressos do Usuário
  getAllUserProgress(userId?: string): TrainingProgress[] {
    const targetUserId = userId || this.getCurrentUserId();
    return this.progressData.filter(p => p.userId === targetUserId);
  }

  // Gerar Relatórios
  generateAnalyticsReport(): AnalyticsData {
    const totalUsers = new Set(this.progressData.map(p => p.userId)).size;
    const activeUsers = new Set(
      this.progressData
        .filter(p => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return p.lastAccessed > oneWeekAgo;
        })
        .map(p => p.userId)
    ).size;

    const totalTrainings = new Set(this.progressData.map(p => p.trainingId)).size;
    const totalCompletions = this.progressData.filter(p => p.status === 'completed').length;
    const averageCompletionRate = totalTrainings > 0 ? (totalCompletions / totalTrainings) * 100 : 0;
    
    const completedTrainings = this.progressData.filter(p => p.status === 'completed' && p.score);
    const averageScore = completedTrainings.length > 0
      ? completedTrainings.reduce((sum, p) => sum + (p.score || 0), 0) / completedTrainings.length
      : 0;

    const popularTrainings = this.getPopularTrainings();
    const userEngagement = this.getUserEngagement();
    const completionTrends = this.getCompletionTrends();

    this.analyticsData = {
      totalUsers,
      activeUsers,
      totalTrainings,
      totalCompletions,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      popularTrainings,
      userEngagement,
      completionTrends,
    };

    return this.analyticsData;
  }

  private getPopularTrainings(): PopularTraining[] {
    const trainingStats: { [key: string]: PopularTraining } = {};

    this.progressData.forEach(progress => {
      if (!trainingStats[progress.trainingId]) {
        trainingStats[progress.trainingId] = {
          trainingId: progress.trainingId,
          title: progress.trainingTitle,
          enrollments: 0,
          completions: 0,
          averageScore: 0,
          averageTimeSpent: 0,
        };
      }

      trainingStats[progress.trainingId].enrollments++;
      trainingStats[progress.trainingId].averageTimeSpent += progress.timeSpent;

      if (progress.status === 'completed') {
        trainingStats[progress.trainingId].completions++;
        if (progress.score) {
          trainingStats[progress.trainingId].averageScore = 
            (trainingStats[progress.trainingId].averageScore + progress.score) / 2;
        }
      }
    });

    return Object.values(trainingStats)
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);
  }

  private getUserEngagement(): UserEngagement[] {
    const userStats: { [key: string]: UserEngagement } = {};

    this.progressData.forEach(progress => {
      if (!userStats[progress.userId]) {
        userStats[progress.userId] = {
          userId: progress.userId,
          name: `Usuário ${progress.userId}`,
          email: `${progress.userId}@example.com`,
          totalTimeSpent: 0,
          trainingsCompleted: 0,
          averageScore: 0,
          lastActivity: progress.lastAccessed,
          engagementScore: 0,
        };
      }

      userStats[progress.userId].totalTimeSpent += progress.timeSpent;
      userStats[progress.userId].lastActivity = 
        progress.lastAccessed > userStats[progress.userId].lastActivity
          ? progress.lastAccessed
          : userStats[progress.userId].lastActivity;

      if (progress.status === 'completed') {
        userStats[progress.userId].trainingsCompleted++;
        if (progress.score) {
          userStats[progress.userId].averageScore = 
            (userStats[progress.userId].averageScore + progress.score) / 2;
        }
      }
    });

    // Calcular score de engajamento
    Object.values(userStats).forEach(user => {
      const timeScore = Math.min(user.totalTimeSpent / 100, 50); // Máximo 50 pontos por tempo
      const completionScore = Math.min(user.trainingsCompleted * 10, 30); // Máximo 30 pontos por completions
      const recencyScore = this.calculateRecencyScore(user.lastActivity); // Máximo 20 pontos por recência
      
      user.engagementScore = Math.round(timeScore + completionScore + recencyScore);
    });

    return Object.values(userStats)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 20);
  }

  private calculateRecencyScore(lastActivity: Date): number {
    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity === 0) return 20;
    if (daysSinceLastActivity <= 7) return 15;
    if (daysSinceLastActivity <= 30) return 10;
    if (daysSinceLastActivity <= 90) return 5;
    return 0;
  }

  private getCompletionTrends(): CompletionTrend[] {
    const trends: { [key: string]: CompletionTrend } = {};
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    this.progressData
      .filter(p => p.lastAccessed >= last30Days)
      .forEach(progress => {
        const date = this.getDateString(progress.lastAccessed);
        
        if (!trends[date]) {
          trends[date] = {
            date,
            completions: 0,
            newEnrollments: 0,
            averageScore: 0,
          };
        }

        trends[date].newEnrollments++;

        if (progress.status === 'completed') {
          trends[date].completions++;
          if (progress.score) {
            trends[date].averageScore = 
              (trends[date].averageScore + progress.score) / 2;
          }
        }
      });

    return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Utilitários
  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getMonthString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Exportar dados
  exportData(): string {
    return JSON.stringify({
      progress: this.progressData,
      performance: this.performanceData,
      analytics: this.analyticsData,
    }, null, 2);
  }

  // Limpar dados antigos
  cleanup() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    this.progressData = this.progressData.filter(p => p.lastAccessed > oneYearAgo);
    this.saveToStorage();
  }
}

export const analyticsService = new AnalyticsService();

// Hook para usar analytics em componentes React
export const useAnalytics = () => {
  return {
    trackProgress: analyticsService.trackProgress.bind(analyticsService),
    trackModuleProgress: analyticsService.trackModuleProgress.bind(analyticsService),
    trackTestResult: analyticsService.trackTestResult.bind(analyticsService),
    getUserPerformance: analyticsService.getUserPerformance.bind(analyticsService),
    getTrainingProgress: analyticsService.getTrainingProgress.bind(analyticsService),
    getAllUserProgress: analyticsService.getAllUserProgress.bind(analyticsService),
    generateAnalyticsReport: analyticsService.generateAnalyticsReport.bind(analyticsService),
    exportData: analyticsService.exportData.bind(analyticsService),
  };
};
