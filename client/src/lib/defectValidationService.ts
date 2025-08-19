import { 
  InspectionValidation, 
  InspectionQuestion, 
  InspectionResult 
} from "@/hooks/use-inspection-plans";

export interface DefectCounts {
  critical: number;
  major: number;
  minor: number;
}

export interface AQLLimits {
  critical: number;
  major: number;
  minor: number;
}

export class DefectValidationService {
  
  /**
   * Calcula os defeitos baseado nas respostas das perguntas
   */
  static calculateDefects(
    answers: Array<{ questionId: string; value: any }>,
    questions: InspectionQuestion[]
  ): DefectCounts {
    let critical = 0;
    let major = 0;
    let minor = 0;
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && this.isDefect(answer, question)) {
        switch (question.defectType) {
          case 'CRITICAL':
            critical++;
            break;
          case 'MAJOR':
            major++;
            break;
          case 'MINOR':
            minor++;
            break;
        }
      }
    });
    
    return { critical, major, minor };
  }
  
  /**
   * Verifica se uma resposta é um defeito baseado na configuração da pergunta
   */
  private static isDefect(answer: { questionId: string; value: any }, question: InspectionQuestion): boolean {
    switch (question.type) {
      case 'ok_nok':
        return answer.value === question.defectConfig?.ok_nok?.nokValue;
      
      case 'yes_no':
        return answer.value === 'NÃO' || answer.value === false;
      
      case 'number':
        const numValue = Number(answer.value);
        const config = question.defectConfig?.numeric;
        if (config) {
          return numValue < config.min || numValue > config.max;
        }
        return false;
      
      case 'scale_1_5':
        const scaleValue = Number(answer.value);
        const threshold = question.defectConfig?.scale?.passThreshold || 4;
        return scaleValue < threshold;
      
      case 'text':
        // Para perguntas de texto, considera defeito se estiver vazio (quando obrigatória)
        return question.required && (!answer.value || answer.value.trim() === '');
      
      case 'photo':
        // Para perguntas de foto, considera defeito se não houver foto (quando obrigatória)
        return question.required && !answer.value;
      
      default:
        return false;
    }
  }
  
  /**
   * Valida os defeitos contra os limites AQL
   */
  static validateDefects(
    defects: DefectCounts,
    aqlLimits: AQLLimits
  ): InspectionValidation {
    
    const validation: InspectionValidation = {
      critical: defects.critical <= aqlLimits.critical ? 'PASS' : 'FAIL',
      major: defects.major <= aqlLimits.major ? 'PASS' : 'FAIL',
      minor: defects.minor <= aqlLimits.minor ? 'PASS' : 'FAIL',
      overall: 'APPROVED'
    };
    
    // Regra 1: Defeito crítico = REJEIÇÃO AUTOMÁTICA
    if (defects.critical > aqlLimits.critical) {
      validation.overall = 'REJECTED';
      return validation;
    }
    
    // Regra 2: Se todos passaram = APROVAÇÃO
    if (validation.critical === 'PASS' && 
        validation.major === 'PASS' && 
        validation.minor === 'PASS') {
      validation.overall = 'APPROVED';
      return validation;
    }
    
    // Regra 3: Se falhou em maior ou menor = APROVAÇÃO CONDICIONAL
    if (validation.major === 'FAIL' || validation.minor === 'FAIL') {
      validation.overall = 'CONDITIONAL_APPROVAL';
      return validation;
    }
    
    return validation;
  }
  
  /**
   * Verifica se pode solicitar aprovação condicional
   */
  static canRequestConditionalApproval(validation: InspectionValidation): boolean {
    return validation.overall === 'CONDITIONAL_APPROVAL' && validation.critical === 'PASS';
  }
  
  /**
   * Gera mensagem explicativa do resultado
   */
  static getResultMessage(validation: InspectionValidation, defects: DefectCounts, aqlLimits: AQLLimits): string {
    switch (validation.overall) {
      case 'APPROVED':
        return 'Inspeção aprovada - Todos os critérios foram atendidos.';
      
      case 'REJECTED':
        if (defects.critical > aqlLimits.critical) {
          return `Inspeção rejeitada - ${defects.critical} defeito(s) crítico(s) encontrado(s). Rejeição automática.`;
        }
        return 'Inspeção rejeitada - Critérios não atendidos.';
      
      case 'CONDITIONAL_APPROVAL':
        const reasons = [];
        if (defects.major > aqlLimits.major) {
          reasons.push(`${defects.major} defeito(s) maior(es)`);
        }
        if (defects.minor > aqlLimits.minor) {
          reasons.push(`${defects.minor} defeito(s) menor(es)`);
        }
        return `Aprovação condicional necessária - ${reasons.join(' e ')} encontrado(s).`;
      
      default:
        return 'Resultado não determinado.';
    }
  }
  
  /**
   * Calcula estatísticas da inspeção
   */
  static calculateStatistics(
    answers: Array<{ questionId: string; value: any }>,
    questions: InspectionQuestion[]
  ) {
    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const requiredQuestions = questions.filter(q => q.required).length;
    const answeredRequired = answers.filter(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      return question?.required;
    }).length;
    
    const defects = this.calculateDefects(answers, questions);
    const totalDefects = defects.critical + defects.major + defects.minor;
    
    return {
      totalQuestions,
      answeredQuestions,
      requiredQuestions,
      answeredRequired,
      completionRate: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      requiredCompletionRate: requiredQuestions > 0 ? (answeredRequired / requiredQuestions) * 100 : 0,
      totalDefects,
      defects
    };
  }
  
  /**
   * Gera relatório detalhado da inspeção
   */
  static generateReport(
    inspection: InspectionResult,
    questions: InspectionQuestion[],
    answers: Array<{ questionId: string; value: any }>
  ) {
    const statistics = this.calculateStatistics(answers, questions);
    const message = this.getResultMessage(inspection.validation, inspection.defects, inspection.aqlLimits);
    
    return {
      inspectionCode: inspection.inspectionCode,
      voltage: inspection.voltage,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR'),
      
      // Estatísticas
      statistics,
      
      // Validação
      validation: inspection.validation,
      message,
      
      // Defeitos detalhados
      defects: {
        critical: {
          count: inspection.defects.critical,
          limit: inspection.aqlLimits.critical,
          passed: inspection.validation.critical === 'PASS'
        },
        major: {
          count: inspection.defects.major,
          limit: inspection.aqlLimits.major,
          passed: inspection.validation.major === 'PASS'
        },
        minor: {
          count: inspection.defects.minor,
          limit: inspection.aqlLimits.minor,
          passed: inspection.validation.minor === 'PASS'
        }
      },
      
      // Respostas detalhadas
      detailedAnswers: answers.map(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        const isDefect = question ? this.isDefect(answer, question) : false;
        
        return {
          question: question?.question || 'Pergunta não encontrada',
          answer: answer.value,
          defectType: question?.defectType,
          isDefect,
          required: question?.required || false
        };
      }),
      
      // Aprovação condicional
      conditionalApproval: inspection.conditionalApproval
    };
  }
}
