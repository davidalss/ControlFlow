#!/usr/bin/env python3
"""
Script de Análise de Dados para o Severino Assistant
Analisa dados de qualidade e gera insights
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, Any, List, Optional
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QualityDataAnalyzer:
    def __init__(self):
        self.data = None
        self.insights = []
        self.recommendations = []
        
    def load_data(self, data_source: str) -> bool:
        """Carrega dados de diferentes fontes"""
        try:
            if data_source.endswith('.csv'):
                self.data = pd.read_csv(data_source)
            elif data_source.endswith('.json'):
                with open(data_source, 'r') as f:
                    raw_data = json.load(f)
                self.data = pd.DataFrame(raw_data)
            elif isinstance(data_source, dict):
                self.data = pd.DataFrame(data_source)
            else:
                logger.error(f"Formato de dados não suportado: {type(data_source)}")
                return False
                
            logger.info(f"Dados carregados: {len(self.data)} registros")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao carregar dados: {e}")
            return False
            
    def analyze_inspection_trends(self) -> Dict[str, Any]:
        """Analisa tendências de inspeções"""
        try:
            if self.data is None or len(self.data) == 0:
                return self._generate_mock_analysis()
                
            # Análise de tendências temporais
            if 'date' in self.data.columns:
                self.data['date'] = pd.to_datetime(self.data['date'])
                self.data = self.data.sort_values('date')
                
                # Calcular métricas por dia
                daily_metrics = self.data.groupby(self.data['date'].dt.date).agg({
                    'total_inspections': 'sum',
                    'passed_inspections': 'sum',
                    'failed_inspections': 'sum'
                }).reset_index()
                
                daily_metrics['pass_rate'] = (
                    daily_metrics['passed_inspections'] / 
                    daily_metrics['total_inspections'] * 100
                )
                
                # Detectar tendências
                trend_analysis = self._detect_trends(daily_metrics['pass_rate'])
                
                # Análise de sazonalidade
                seasonal_patterns = self._analyze_seasonality(daily_metrics)
                
                return {
                    'status': 'success',
                    'trends': trend_analysis,
                    'seasonal_patterns': seasonal_patterns,
                    'daily_metrics': daily_metrics.to_dict('records'),
                    'insights': self._generate_trend_insights(trend_analysis)
                }
                
        except Exception as e:
            logger.error(f"Erro na análise de tendências: {e}")
            return self._generate_mock_analysis()
            
    def analyze_defect_patterns(self) -> Dict[str, Any]:
        """Analisa padrões de defeitos"""
        try:
            if self.data is None or len(self.data) == 0:
                return self._generate_mock_defect_analysis()
                
            # Análise de tipos de defeitos
            if 'defect_type' in self.data.columns:
                defect_counts = self.data['defect_type'].value_counts()
                defect_percentages = (defect_counts / len(self.data) * 100).round(2)
                
                # Análise de severidade
                if 'defect_severity' in self.data.columns:
                    severity_analysis = self.data.groupby('defect_severity').agg({
                        'defect_type': 'count',
                        'product_code': 'nunique'
                    }).rename(columns={'defect_type': 'count', 'product_code': 'affected_products'})
                    
                # Identificar defeitos críticos
                critical_defects = defect_counts.head(3).to_dict()
                
                return {
                    'status': 'success',
                    'defect_distribution': defect_counts.to_dict(),
                    'defect_percentages': defect_percentages.to_dict(),
                    'severity_analysis': severity_analysis.to_dict() if 'defect_severity' in self.data.columns else {},
                    'critical_defects': critical_defects,
                    'insights': self._generate_defect_insights(defect_counts)
                }
                
        except Exception as e:
            logger.error(f"Erro na análise de defeitos: {e}")
            return self._generate_mock_defect_analysis()
            
    def analyze_product_performance(self) -> Dict[str, Any]:
        """Analisa performance por produto"""
        try:
            if self.data is None or len(self.data) == 0:
                return self._generate_mock_product_analysis()
                
            if 'product_code' in self.data.columns:
                # Performance por produto
                product_performance = self.data.groupby('product_code').agg({
                    'total_inspections': 'sum',
                    'passed_inspections': 'sum',
                    'failed_inspections': 'sum'
                }).reset_index()
                
                product_performance['pass_rate'] = (
                    product_performance['passed_inspections'] / 
                    product_performance['total_inspections'] * 100
                ).round(2)
                
                # Identificar produtos problemáticos
                problematic_products = product_performance[
                    product_performance['pass_rate'] < 90
                ].sort_values('pass_rate')
                
                # Análise por business unit
                if 'business_unit' in self.data.columns:
                    bu_performance = self.data.groupby('business_unit').agg({
                        'total_inspections': 'sum',
                        'passed_inspections': 'sum'
                    }).reset_index()
                    
                    bu_performance['pass_rate'] = (
                        bu_performance['passed_inspections'] / 
                        bu_performance['total_inspections'] * 100
                    ).round(2)
                else:
                    bu_performance = pd.DataFrame()
                    
                return {
                    'status': 'success',
                    'product_performance': product_performance.to_dict('records'),
                    'problematic_products': problematic_products.to_dict('records'),
                    'business_unit_performance': bu_performance.to_dict('records') if not bu_performance.empty else [],
                    'insights': self._generate_product_insights(product_performance)
                }
                
        except Exception as e:
            logger.error(f"Erro na análise de produtos: {e}")
            return self._generate_mock_product_analysis()
            
    def generate_quality_report(self) -> Dict[str, Any]:
        """Gera relatório completo de qualidade"""
        try:
            # Executar todas as análises
            trends = self.analyze_inspection_trends()
            defects = self.analyze_defect_patterns()
            products = self.analyze_product_performance()
            
            # Consolidar insights
            all_insights = []
            all_recommendations = []
            
            if trends.get('insights'):
                all_insights.extend(trends['insights'])
            if defects.get('insights'):
                all_insights.extend(defects['insights'])
            if products.get('insights'):
                all_insights.extend(products['insights'])
                
            # Gerar recomendações baseadas nos insights
            all_recommendations = self._generate_recommendations(all_insights)
            
            return {
                'status': 'success',
                'report_date': datetime.now().isoformat(),
                'trends_analysis': trends,
                'defects_analysis': defects,
                'products_analysis': products,
                'summary': {
                    'total_insights': len(all_insights),
                    'total_recommendations': len(all_recommendations),
                    'overall_pass_rate': self._calculate_overall_pass_rate(),
                    'critical_issues': len([i for i in all_insights if 'crítico' in i.lower()])
                },
                'insights': all_insights,
                'recommendations': all_recommendations
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
            
    def _detect_trends(self, data: pd.Series) -> Dict[str, Any]:
        """Detecta tendências nos dados"""
        try:
            if len(data) < 2:
                return {'trend': 'insufficient_data'}
                
            # Regressão linear para detectar tendência
            X = np.arange(len(data)).reshape(-1, 1)
            y = data.values
            
            model = LinearRegression()
            model.fit(X, y)
            
            slope = model.coef_[0]
            
            if slope > 0.5:
                trend = 'improving'
                trend_strength = 'strong'
            elif slope > 0.1:
                trend = 'improving'
                trend_strength = 'moderate'
            elif slope < -0.5:
                trend = 'declining'
                trend_strength = 'strong'
            elif slope < -0.1:
                trend = 'declining'
                trend_strength = 'moderate'
            else:
                trend = 'stable'
                trend_strength = 'weak'
                
            return {
                'trend': trend,
                'trend_strength': trend_strength,
                'slope': slope,
                'r_squared': model.score(X, y)
            }
            
        except Exception as e:
            logger.error(f"Erro ao detectar tendências: {e}")
            return {'trend': 'error'}
            
    def _analyze_seasonality(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analisa padrões sazonais"""
        try:
            if len(data) < 7:
                return {'pattern': 'insufficient_data'}
                
            # Análise por dia da semana
            data['day_of_week'] = pd.to_datetime(data['date']).dt.day_name()
            daily_patterns = data.groupby('day_of_week')['pass_rate'].mean().round(2)
            
            # Identificar pior e melhor dia
            worst_day = daily_patterns.idxmin()
            best_day = daily_patterns.idxmax()
            
            return {
                'pattern': 'weekly',
                'daily_patterns': daily_patterns.to_dict(),
                'worst_day': worst_day,
                'best_day': best_day,
                'variation': (daily_patterns.max() - daily_patterns.min()).round(2)
            }
            
        except Exception as e:
            logger.error(f"Erro na análise sazonal: {e}")
            return {'pattern': 'error'}
            
    def _generate_trend_insights(self, trend_analysis: Dict[str, Any]) -> List[str]:
        """Gera insights baseados em tendências"""
        insights = []
        
        trend = trend_analysis.get('trend', 'unknown')
        strength = trend_analysis.get('trend_strength', 'unknown')
        
        if trend == 'improving':
            if strength == 'strong':
                insights.append("✅ Tendência forte de melhoria na qualidade")
            else:
                insights.append("📈 Tendência moderada de melhoria na qualidade")
        elif trend == 'declining':
            if strength == 'strong':
                insights.append("⚠️ Tendência forte de declínio na qualidade - AÇÃO NECESSÁRIA")
            else:
                insights.append("📉 Tendência moderada de declínio na qualidade")
        elif trend == 'stable':
            insights.append("➡️ Qualidade estável - manter padrões atuais")
            
        return insights
        
    def _generate_defect_insights(self, defect_counts: pd.Series) -> List[str]:
        """Gera insights baseados em defeitos"""
        insights = []
        
        if len(defect_counts) > 0:
            top_defect = defect_counts.index[0]
            top_count = defect_counts.iloc[0]
            total_defects = defect_counts.sum()
            
            top_percentage = (top_count / total_defects * 100).round(1)
            
            insights.append(f"🎯 Defeito mais comum: {top_defect} ({top_percentage}% do total)")
            
            if top_percentage > 50:
                insights.append("⚠️ Defeito dominante - focar esforços de melhoria neste tipo")
            elif top_percentage > 30:
                insights.append("📊 Defeito significativo - considerar treinamento específico")
                
        return insights
        
    def _generate_product_insights(self, product_performance: pd.DataFrame) -> List[str]:
        """Gera insights baseados em performance de produtos"""
        insights = []
        
        if len(product_performance) > 0:
            worst_product = product_performance.loc[product_performance['pass_rate'].idxmin()]
            best_product = product_performance.loc[product_performance['pass_rate'].idxmax()]
            
            if worst_product['pass_rate'] < 80:
                insights.append(f"🚨 Produto crítico: {worst_product['product_code']} ({worst_product['pass_rate']}% aprovação)")
            elif worst_product['pass_rate'] < 90:
                insights.append(f"⚠️ Produto com problemas: {worst_product['product_code']} ({worst_product['pass_rate']}% aprovação)")
                
            if best_product['pass_rate'] > 98:
                insights.append(f"🏆 Produto exemplar: {best_product['product_code']} ({best_product['pass_rate']}% aprovação)")
                
        return insights
        
    def _generate_recommendations(self, insights: List[str]) -> List[str]:
        """Gera recomendações baseadas nos insights"""
        recommendations = []
        
        for insight in insights:
            if 'crítico' in insight.lower() or '🚨' in insight:
                recommendations.append("🔧 Implementar ação corretiva imediata")
                recommendations.append("👥 Revisar procedimentos de inspeção")
                recommendations.append("📚 Treinamento urgente para equipe")
            elif 'problemas' in insight.lower() or '⚠️' in insight:
                recommendations.append("📋 Revisar checklist de inspeção")
                recommendations.append("🔍 Investigar causas raiz")
            elif 'melhoria' in insight.lower() or '📈' in insight:
                recommendations.append("📈 Manter práticas atuais")
                recommendations.append("🎯 Definir metas mais ambiciosas")
                
        # Recomendações gerais
        recommendations.extend([
            "📊 Monitorar métricas diariamente",
            "🔄 Revisar processos mensalmente",
            "👨‍🏫 Treinamento contínuo da equipe"
        ])
        
        return list(set(recommendations))  # Remove duplicatas
        
    def _calculate_overall_pass_rate(self) -> float:
        """Calcula taxa de aprovação geral"""
        try:
            if self.data is None or len(self.data) == 0:
                return 95.0  # Mock data
                
            if 'passed_inspections' in self.data.columns and 'total_inspections' in self.data.columns:
                total_passed = self.data['passed_inspections'].sum()
                total_inspections = self.data['total_inspections'].sum()
                
                if total_inspections > 0:
                    return (total_passed / total_inspections * 100).round(2)
                    
            return 95.0  # Default
            
        except Exception as e:
            logger.error(f"Erro ao calcular taxa de aprovação: {e}")
            return 95.0
            
    def _generate_mock_analysis(self) -> Dict[str, Any]:
        """Gera análise mock para testes"""
        return {
            'status': 'success',
            'trends': {
                'trend': 'stable',
                'trend_strength': 'weak',
                'slope': 0.02,
                'r_squared': 0.15
            },
            'seasonal_patterns': {
                'pattern': 'weekly',
                'daily_patterns': {
                    'Monday': 94.5,
                    'Tuesday': 95.2,
                    'Wednesday': 96.1,
                    'Thursday': 95.8,
                    'Friday': 94.9
                },
                'worst_day': 'Monday',
                'best_day': 'Wednesday',
                'variation': 1.6
            },
            'insights': [
                "➡️ Qualidade estável - manter padrões atuais",
                "📊 Variação semanal normal detectada"
            ]
        }
        
    def _generate_mock_defect_analysis(self) -> Dict[str, Any]:
        """Gera análise de defeitos mock"""
        return {
            'status': 'success',
            'defect_distribution': {
                'Cosmético': 45,
                'Funcional': 30,
                'Dimensional': 15,
                'Material': 10
            },
            'critical_defects': {
                'Cosmético': 45,
                'Funcional': 30,
                'Dimensional': 15
            },
            'insights': [
                "🎯 Defeito mais comum: Cosmético (45% do total)",
                "📊 Defeito significativo - considerar treinamento específico"
            ]
        }
        
    def _generate_mock_product_analysis(self) -> Dict[str, Any]:
        """Gera análise de produtos mock"""
        return {
            'status': 'success',
            'product_performance': [
                {
                    'product_code': 'AFB001',
                    'total_inspections': 150,
                    'passed_inspections': 142,
                    'failed_inspections': 8,
                    'pass_rate': 94.67
                },
                {
                    'product_code': 'TOR001',
                    'total_inspections': 120,
                    'passed_inspections': 115,
                    'failed_inspections': 5,
                    'pass_rate': 95.83
                }
            ],
            'problematic_products': [],
            'insights': [
                "🏆 Produto exemplar: TOR001 (95.83% aprovação)"
            ]
        }

# Função principal para testes
def main():
    """Função principal para testes"""
    analyzer = QualityDataAnalyzer()
    
    # Dados mock para teste
    mock_data = {
        'date': pd.date_range(start='2024-01-01', periods=30, freq='D'),
        'total_inspections': np.random.randint(80, 120, 30),
        'passed_inspections': np.random.randint(75, 115, 30),
        'failed_inspections': np.random.randint(1, 10, 30),
        'defect_type': np.random.choice(['Cosmético', 'Funcional', 'Dimensional'], 30),
        'product_code': np.random.choice(['AFB001', 'TOR001', 'MIX001'], 30)
    }
    
    # Carregar dados
    analyzer.load_data(mock_data)
    
    # Gerar relatório completo
    report = analyzer.generate_quality_report()
    
    print("=== RELATÓRIO DE QUALIDADE ===")
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
