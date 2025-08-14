// Sistema de Comentários e Avaliações
export interface Comment {
  id: string;
  trainingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number; // 1-5 estrelas
  timestamp: Date;
  likes: number;
  dislikes: number;
  replies: Reply[];
  isEdited: boolean;
  isDeleted: boolean;
  helpful: boolean;
  category: 'general' | 'question' | 'feedback' | 'review';
  tags: string[];
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface TrainingRating {
  trainingId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  totalComments: number;
  helpfulComments: number;
}

class CommentService {
  private comments: Comment[] = [];
  private ratings: TrainingRating[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedComments = localStorage.getItem('trainingComments');
      if (storedComments) {
        this.comments = JSON.parse(storedComments).map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
          replies: c.replies.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp),
          })),
        }));
      }

      const storedRatings = localStorage.getItem('trainingRatings');
      if (storedRatings) {
        this.ratings = JSON.parse(storedRatings);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('trainingComments', JSON.stringify(this.comments));
      localStorage.setItem('trainingRatings', JSON.stringify(this.ratings));
    } catch (error) {
      console.error('Erro ao salvar comentários:', error);
    }
  }

  // Criar comentário
  createComment(
    trainingId: string,
    content: string,
    rating: number,
    category: Comment['category'] = 'general',
    tags: string[] = []
  ): Comment {
    const userId = this.getCurrentUserId();
    const userName = this.getCurrentUserName();

    const comment: Comment = {
      id: this.generateId(),
      trainingId,
      userId,
      userName,
      content,
      rating,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      isEdited: false,
      isDeleted: false,
      helpful: false,
      category,
      tags,
    };

    this.comments.push(comment);
    this.updateTrainingRating(trainingId);
    this.saveToStorage();

    return comment;
  }

  // Editar comentário
  editComment(commentId: string, content: string): Comment | null {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment && comment.userId === this.getCurrentUserId()) {
      comment.content = content;
      comment.isEdited = true;
      this.saveToStorage();
      return comment;
    }
    return null;
  }

  // Deletar comentário
  deleteComment(commentId: string): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment && comment.userId === this.getCurrentUserId()) {
      comment.isDeleted = true;
      this.updateTrainingRating(comment.trainingId);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Adicionar resposta
  addReply(commentId: string, content: string): Reply | null {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      const userId = this.getCurrentUserId();
      const userName = this.getCurrentUserName();

      const reply: Reply = {
        id: this.generateId(),
        commentId,
        userId,
        userName,
        content,
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        isEdited: false,
        isDeleted: false,
      };

      comment.replies.push(reply);
      this.saveToStorage();
      return reply;
    }
    return null;
  }

  // Editar resposta
  editReply(replyId: string, content: string): Reply | null {
    for (const comment of this.comments) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply && reply.userId === this.getCurrentUserId()) {
        reply.content = content;
        reply.isEdited = true;
        this.saveToStorage();
        return reply;
      }
    }
    return null;
  }

  // Deletar resposta
  deleteReply(replyId: string): boolean {
    for (const comment of this.comments) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply && reply.userId === this.getCurrentUserId()) {
        reply.isDeleted = true;
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Like/Dislike comentário
  likeComment(commentId: string, like: boolean): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      if (like) {
        comment.likes++;
      } else {
        comment.dislikes++;
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Like/Dislike resposta
  likeReply(replyId: string, like: boolean): boolean {
    for (const comment of this.comments) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply) {
        if (like) {
          reply.likes++;
        } else {
          reply.dislikes++;
        }
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Marcar comentário como útil
  markAsHelpful(commentId: string): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.helpful = !comment.helpful;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Obter comentários de um treinamento
  getTrainingComments(
    trainingId: string,
    options: {
      sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful' | 'likes';
      filterBy?: Comment['category'];
      minRating?: number;
      searchTerm?: string;
      limit?: number;
    } = {}
  ): Comment[] {
    let comments = this.comments.filter(c => 
      c.trainingId === trainingId && !c.isDeleted
    );

    // Filtrar por categoria
    if (options.filterBy) {
      comments = comments.filter(c => c.category === options.filterBy);
    }

    // Filtrar por rating mínimo
    if (options.minRating) {
      comments = comments.filter(c => c.rating >= options.minRating);
    }

    // Filtrar por termo de busca
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      comments = comments.filter(c => 
        c.content.toLowerCase().includes(term) ||
        c.userName.toLowerCase().includes(term) ||
        c.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Ordenar
    switch (options.sortBy) {
      case 'oldest':
        comments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        break;
      case 'rating':
        comments.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        comments.sort((a, b) => (b.helpful ? 1 : 0) - (a.helpful ? 1 : 0));
        break;
      case 'likes':
        comments.sort((a, b) => b.likes - a.likes);
        break;
      default: // newest
        comments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Limitar resultados
    if (options.limit) {
      comments = comments.slice(0, options.limit);
    }

    return comments;
  }

  // Obter rating de um treinamento
  getTrainingRating(trainingId: string): TrainingRating | null {
    return this.ratings.find(r => r.trainingId === trainingId) || null;
  }

  // Atualizar rating do treinamento
  private updateTrainingRating(trainingId: string) {
    const trainingComments = this.comments.filter(c => 
      c.trainingId === trainingId && !c.isDeleted
    );

    if (trainingComments.length === 0) {
      this.ratings = this.ratings.filter(r => r.trainingId !== trainingId);
      return;
    }

    const totalRatings = trainingComments.length;
    const averageRating = trainingComments.reduce((sum, c) => sum + c.rating, 0) / totalRatings;
    
    const ratingDistribution = {
      '1': trainingComments.filter(c => c.rating === 1).length,
      '2': trainingComments.filter(c => c.rating === 2).length,
      '3': trainingComments.filter(c => c.rating === 3).length,
      '4': trainingComments.filter(c => c.rating === 4).length,
      '5': trainingComments.filter(c => c.rating === 5).length,
    };

    const totalComments = trainingComments.length;
    const helpfulComments = trainingComments.filter(c => c.helpful).length;

    const rating: TrainingRating = {
      trainingId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution,
      totalComments,
      helpfulComments,
    };

    const existingIndex = this.ratings.findIndex(r => r.trainingId === trainingId);
    if (existingIndex >= 0) {
      this.ratings[existingIndex] = rating;
    } else {
      this.ratings.push(rating);
    }
  }

  // Obter comentários do usuário
  getUserComments(userId?: string): Comment[] {
    const targetUserId = userId || this.getCurrentUserId();
    return this.comments.filter(c => 
      c.userId === targetUserId && !c.isDeleted
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Obter estatísticas de comentários
  getCommentStats(trainingId: string) {
    const comments = this.comments.filter(c => c.trainingId === trainingId);
    const totalComments = comments.length;
    const totalReplies = comments.reduce((sum, c) => sum + c.replies.length, 0);
    const averageRating = comments.length > 0
      ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
      : 0;
    const helpfulComments = comments.filter(c => c.helpful).length;

    return {
      totalComments,
      totalReplies,
      averageRating: Math.round(averageRating * 10) / 10,
      helpfulComments,
      categories: {
        general: comments.filter(c => c.category === 'general').length,
        question: comments.filter(c => c.category === 'question').length,
        feedback: comments.filter(c => c.category === 'feedback').length,
        review: comments.filter(c => c.category === 'review').length,
      },
    };
  }

  // Buscar comentários
  searchComments(
    searchTerm: string,
    options: {
      trainingId?: string;
      category?: Comment['category'];
      minRating?: number;
      limit?: number;
    } = {}
  ): Comment[] {
    let comments = this.comments.filter(c => !c.isDeleted);

    // Filtrar por treinamento
    if (options.trainingId) {
      comments = comments.filter(c => c.trainingId === options.trainingId);
    }

    // Filtrar por categoria
    if (options.category) {
      comments = comments.filter(c => c.category === options.category);
    }

    // Filtrar por rating mínimo
    if (options.minRating) {
      comments = comments.filter(c => c.rating >= options.minRating);
    }

    // Buscar por termo
    const term = searchTerm.toLowerCase();
    comments = comments.filter(c => 
      c.content.toLowerCase().includes(term) ||
      c.userName.toLowerCase().includes(term) ||
      c.tags.some(tag => tag.toLowerCase().includes(term)) ||
      c.replies.some(reply => 
        reply.content.toLowerCase().includes(term) ||
        reply.userName.toLowerCase().includes(term)
      )
    );

    // Ordenar por relevância (comentários com mais likes primeiro)
    comments.sort((a, b) => b.likes - a.likes);

    // Limitar resultados
    if (options.limit) {
      comments = comments.slice(0, options.limit);
    }

    return comments;
  }

  // Obter comentários populares
  getPopularComments(trainingId?: string, limit: number = 10): Comment[] {
    let comments = this.comments.filter(c => !c.isDeleted);

    if (trainingId) {
      comments = comments.filter(c => c.trainingId === trainingId);
    }

    // Ordenar por popularidade (likes + helpful + replies)
    comments.sort((a, b) => {
      const scoreA = a.likes + (a.helpful ? 5 : 0) + a.replies.length;
      const scoreB = b.likes + (b.helpful ? 5 : 0) + b.replies.length;
      return scoreB - scoreA;
    });

    return comments.slice(0, limit);
  }

  // Obter comentários recentes
  getRecentComments(trainingId?: string, limit: number = 10): Comment[] {
    let comments = this.comments.filter(c => !c.isDeleted);

    if (trainingId) {
      comments = comments.filter(c => c.trainingId === trainingId);
    }

    comments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return comments.slice(0, limit);
  }

  // Utilitários
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private getCurrentUserName(): string {
    return localStorage.getItem('userName') || 'Usuário Anônimo';
  }

  // Exportar dados
  exportData(): string {
    return JSON.stringify({
      comments: this.comments,
      ratings: this.ratings,
    }, null, 2);
  }

  // Limpar dados antigos
  cleanup() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    this.comments = this.comments.filter(c => c.timestamp > oneYearAgo);
    this.saveToStorage();
  }
}

export const commentService = new CommentService();

// Hook para usar comentários em componentes React
export const useComments = () => {
  return {
    createComment: commentService.createComment.bind(commentService),
    editComment: commentService.editComment.bind(commentService),
    deleteComment: commentService.deleteComment.bind(commentService),
    addReply: commentService.addReply.bind(commentService),
    editReply: commentService.editReply.bind(commentService),
    deleteReply: commentService.deleteReply.bind(commentService),
    likeComment: commentService.likeComment.bind(commentService),
    likeReply: commentService.likeReply.bind(commentService),
    markAsHelpful: commentService.markAsHelpful.bind(commentService),
    getTrainingComments: commentService.getTrainingComments.bind(commentService),
    getTrainingRating: commentService.getTrainingRating.bind(commentService),
    getUserComments: commentService.getUserComments.bind(commentService),
    getCommentStats: commentService.getCommentStats.bind(commentService),
    searchComments: commentService.searchComments.bind(commentService),
    getPopularComments: commentService.getPopularComments.bind(commentService),
    getRecentComments: commentService.getRecentComments.bind(commentService),
  };
};
