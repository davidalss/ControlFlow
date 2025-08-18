import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

// Tipos para receitas de perguntas
export interface QuestionRecipe {
  id: string;
  planId: string;
  questionId: string;
  questionName: string;
  questionType: 'number' | 'text' | 'yes_no' | 'ok_nok' | 'scale_1_5' | 'scale_1_10' | 'multiple_choice' | 'true_false' | 'checklist' | 'photo';
  minValue?: number;
  maxValue?: number;
  expectedValue?: string;
  tolerance?: number;
  unit?: string;
  options?: string[];
  defectType: 'MENOR' | 'MAIOR' | 'CRÍTICO';
  isRequired: boolean;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateQuestionRecipeData {
  planId: string;
  questionId: string;
  questionName: string;
  questionType: QuestionRecipe['questionType'];
  minValue?: number;
  maxValue?: number;
  expectedValue?: string;
  tolerance?: number;
  unit?: string;
  options?: string[];
  defectType: QuestionRecipe['defectType'];
  isRequired?: boolean;
  description?: string;
}

export interface UpdateQuestionRecipeData extends Partial<CreateQuestionRecipeData> {
  id: string;
}

export function useQuestionRecipes() {
  const [recipes, setRecipes] = useState<QuestionRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar receitas de um plano
  const loadRecipesByPlan = async (planId: string) => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/question-recipes/plan/${planId}`);
      const data = await response.json();
      
      // Converter options de JSON string para array
      const processedData = data.map((recipe: any) => ({
        ...recipe,
        options: recipe.options ? JSON.parse(recipe.options) : undefined
      }));
      
      setRecipes(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Falha ao carregar receitas de perguntas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar receita específica
  const getRecipe = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/question-recipes/${id}`);
      const data = await response.json();
      
      // Converter options de JSON string para array
      return {
        ...data,
        options: data.options ? JSON.parse(data.options) : undefined
      };
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao buscar receita de pergunta",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Criar nova receita
  const createRecipe = async (recipeData: CreateQuestionRecipeData) => {
    try {
      const response = await apiRequest('POST', '/api/question-recipes', recipeData);
      const newRecipe = await response.json();
      
      // Converter options de JSON string para array
      const processedRecipe = {
        ...newRecipe,
        options: newRecipe.options ? JSON.parse(newRecipe.options) : undefined
      };
      
      setRecipes(prev => [...prev, processedRecipe]);
      
      toast({
        title: "Sucesso",
        description: "Receita de pergunta criada com sucesso"
      });
      
      return processedRecipe;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao criar receita de pergunta",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Atualizar receita
  const updateRecipe = async (id: string, updates: Partial<CreateQuestionRecipeData>) => {
    try {
      const response = await apiRequest('PUT', `/api/question-recipes/${id}`, updates);
      const updatedRecipe = await response.json();
      
      // Converter options de JSON string para array
      const processedRecipe = {
        ...updatedRecipe,
        options: updatedRecipe.options ? JSON.parse(updatedRecipe.options) : undefined
      };
      
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? processedRecipe : recipe
      ));
      
      toast({
        title: "Sucesso",
        description: "Receita de pergunta atualizada com sucesso"
      });
      
      return processedRecipe;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar receita de pergunta",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Excluir receita
  const deleteRecipe = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/question-recipes/${id}`);
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Receita de pergunta excluída com sucesso"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao excluir receita de pergunta",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Criar múltiplas receitas
  const createBulkRecipes = async (planId: string, recipes: CreateQuestionRecipeData[]) => {
    try {
      const response = await apiRequest('POST', '/api/question-recipes/bulk', {
        planId,
        recipes
      });
      const result = await response.json();
      
      // Recarregar receitas do plano
      await loadRecipesByPlan(planId);
      
      toast({
        title: "Sucesso",
        description: `${result.recipes.length} receitas criadas com sucesso`
      });
      
      return result.recipes;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao criar receitas de perguntas",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Validar valor contra receita
  const validateValue = (recipe: QuestionRecipe, value: any): { isValid: boolean; defectType?: QuestionRecipe['defectType']; message?: string } => {
    if (recipe.questionType === 'number') {
      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        return {
          isValid: false,
          defectType: recipe.defectType,
          message: 'Valor não é um número válido'
        };
      }

      // Verificar valor mínimo
      if (recipe.minValue !== undefined && numValue < recipe.minValue) {
        return {
          isValid: false,
          defectType: recipe.defectType,
          message: `Valor ${numValue}${recipe.unit ? ` ${recipe.unit}` : ''} está abaixo do mínimo permitido (${recipe.minValue}${recipe.unit ? ` ${recipe.unit}` : ''})`
        };
      }

      // Verificar valor máximo
      if (recipe.maxValue !== undefined && numValue > recipe.maxValue) {
        return {
          isValid: false,
          defectType: recipe.defectType,
          message: `Valor ${numValue}${recipe.unit ? ` ${recipe.unit}` : ''} está acima do máximo permitido (${recipe.maxValue}${recipe.unit ? ` ${recipe.unit}` : ''})`
        };
      }

      // Verificar valor esperado com tolerância
      if (recipe.expectedValue !== undefined) {
        const expectedValue = parseFloat(recipe.expectedValue);
        const tolerance = recipe.tolerance || 0;
        
        if (Math.abs(numValue - expectedValue) > tolerance) {
          return {
            isValid: false,
            defectType: recipe.defectType,
            message: `Valor ${numValue}${recipe.unit ? ` ${recipe.unit}` : ''} está fora da tolerância esperada (${expectedValue} ± ${tolerance}${recipe.unit ? ` ${recipe.unit}` : ''})`
          };
        }
      }
    }

    // Para outros tipos, sempre considerar válido (validação específica pode ser implementada)
    return { isValid: true };
  };

  // Buscar receita por ID da pergunta
  const getRecipeByQuestionId = (questionId: string): QuestionRecipe | undefined => {
    return recipes.find(recipe => recipe.questionId === questionId);
  };

  return {
    recipes,
    loading,
    error,
    loadRecipesByPlan,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    createBulkRecipes,
    validateValue,
    getRecipeByQuestionId
  };
}
