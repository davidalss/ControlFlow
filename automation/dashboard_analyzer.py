#!/usr/bin/env python3
"""
Script de Análise Avançada de Dashboards para o Severino Assistant
Extrai dados de dashboards, aplica filtros dinâmicos e detecta anomalias
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Browser, Page, BrowserContext
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import warnings
warnings.filterwarnings('ignore')

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DashboardAnalyzer:
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.is_authenticated = False
        
    async def __aenter__(self):
        await self.start_browser()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close_browser()
        
    async def start_browser(self):
        """Inicia o navegador Playwright"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,  # True para execução automática
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            self.page = await self.context.new_page()
            logger.info("Navegador iniciado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao iniciar navegador: {e}")
            raise
            
    async def close_browser(self):
        """Fecha o navegador"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("Navegador fechado")
        except Exception as e:
            logger.error(f"Erro ao fechar navegador: {e}")
            
    async def login(self, email: str, password: str) -> bool:
        """Faz login no sistema"""
        try:
            logger.info(f"Tentando login com email: {email}")
            
            await self.page.goto(f"{self.base_url}/login")
            await self.page.wait_for_load_state('networkidle')
            
            # Preencher formulário de login
            await self.page.fill('input[name="email"]', email)
            await self.page.fill('input[name="password"]', password)
            
            # Clicar no botão de login
            await self.page.click('button[type="submit"]')
            
            # Aguardar redirecionamento
            await self.page.wait_for_url(f"{self.base_url}/dashboard", timeout=10000)
            
            self.is_authenticated = True
            logger.info("Login realizado com sucesso")
            return True
            
        except Exception as e:
            logger.error(f"Erro no login: {e}")
            return False

    async def extract_dashboard_data(self, dashboard_type: str = "quality", filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extrai dados de dashboards específicos"""
        try:
            logger.info(f"Extraindo dados do dashboard: {dashboard_type}")
            
            # Navegar para dashboard específico
            dashboard_urls = {
                "quality": "/dashboard",
                "inspections": "/inspections",
                "training": "/training",
                "reports": "/reports",
                "indicators": "/indicators"
            }
            
            url = dashboard_urls.get(dashboard_type, "/dashboard")
            await self.page.goto(f"{self.base_url}{url}")
            await self.page.wait_for_load_state('networkidle')
            
            # Aplicar filtros se fornecidos
            if filters:
                await self._apply_dashboard_filters(filters)
            
            # Extrair dados baseado no tipo de dashboard
            if dashboard_type == "quality":
                data = await self._extract_quality_dashboard()
            elif dashboard_type == "inspections":
                data = await self._extract_inspections_dashboard()
            elif dashboard_type == "training":
                data = await self._extract_training_dashboard()
            elif dashboard_type == "reports":
                data = await self._extract_reports_dashboard()
            else:
                data = await self._extract_general_dashboard()
            
            logger.info(f"Dados extraídos: {len(data)} registros")
            
            return {
                'success': True,
                'dashboard_type': dashboard_type,
                'data': data,
                'filters_applied': filters,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados do dashboard: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao extrair dados do dashboard'
            }

    async def _apply_dashboard_filters(self, filters: Dict[str, Any]):
        """Aplica filtros no dashboard"""
        try:
            # Filtro por período
            if 'date_from' in filters:
                await self.page.fill('input[name="date_from"], [data-testid="date-from"]', filters['date_from'])
            
            if 'date_to' in filters:
                await self.page.fill('input[name="date_to"], [data-testid="date-to"]', filters['date_to'])
            
            # Filtro por produto
            if 'product' in filters:
                await self.page.select_option('select[name="product"], [data-testid="product-filter"]', filters['product'])
            
            # Filtro por equipe
            if 'team' in filters:
                await self.page.select_option('select[name="team"], [data-testid="team-filter"]', filters['team'])
            
            # Filtro por turno
            if 'shift' in filters:
                await self.page.select_option('select[name="shift"], [data-testid="shift-filter"]', filters['shift'])
            
            # Aplicar filtros
            await self.page.click('button:has-text("Aplicar"), [data-testid="apply-filters"]')
            await self.page.wait_for_load_state('networkidle')
            
        except Exception as e:
            logger.error(f"Erro ao aplicar filtros: {e}")
            raise

    async def _extract_quality_dashboard(self) -> Dict[str, Any]:
        """Extrai dados do dashboard de qualidade"""
        try:
            data = {
                'metrics': {},
                'charts': {},
                'tables': [],
                'alerts': []
            }
            
            # Extrair métricas principais
            metrics_selectors = [
                '[data-testid="approval-rate"], .approval-rate',
                '[data-testid="rejection-rate"], .rejection-rate',
                '[data-testid="total-inspections"], .total-inspections',
                '[data-testid="pending-inspections"], .pending-inspections'
            ]
            
            for selector in metrics_selectors:
                element = await self.page.query_selector(selector)
                if element:
                    metric_name = selector.split('"')[1] if '"' in selector else selector.split('.')[1]
                    value = await element.text_content()
                    data['metrics'][metric_name] = self._parse_metric_value(value)
            
            # Extrair dados de gráficos
            chart_data = await self._extract_chart_data()
            data['charts'] = chart_data
            
            # Extrair dados de tabelas
            table_data = await self._extract_table_data()
            data['tables'] = table_data
            
            # Extrair alertas
            alerts = await self._extract_alerts()
            data['alerts'] = alerts
            
            return data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de qualidade: {e}")
            return {}

    async def _extract_inspections_dashboard(self) -> Dict[str, Any]:
        """Extrai dados do dashboard de inspeções"""
        try:
            data = {
                'inspections': [],
                'defects': {},
                'trends': {},
                'performance': {}
            }
            
            # Extrair lista de inspeções
            inspection_rows = await self.page.query_selector_all('tr[data-testid="inspection-row"], .inspection-row')
            
            for row in inspection_rows:
                try:
                    inspection_data = await self._extract_inspection_row_data(row)
                    data['inspections'].append(inspection_data)
                except Exception as e:
                    logger.warning(f"Erro ao extrair linha de inspeção: {e}")
                    continue
            
            # Extrair dados de defeitos
            defects_data = await self._extract_defects_data()
            data['defects'] = defects_data
            
            # Extrair tendências
            trends_data = await self._extract_trends_data()
            data['trends'] = trends_data
            
            return data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de inspeções: {e}")
            return {}

    async def _extract_training_dashboard(self) -> Dict[str, Any]:
        """Extrai dados do dashboard de treinamentos"""
        try:
            data = {
                'completion_rates': {},
                'pending_trainings': [],
                'overdue_trainings': [],
                'team_performance': {}
            }
            
            # Extrair taxas de conclusão
            completion_elements = await self.page.query_selector_all('[data-testid="completion-rate"], .completion-rate')
            for element in completion_elements:
                team = await element.get_attribute('data-team')
                rate = await element.text_content()
                if team and rate:
                    data['completion_rates'][team] = self._parse_percentage(rate)
            
            # Extrair treinamentos pendentes
            pending_rows = await self.page.query_selector_all('tr[data-testid="pending-training"], .pending-training')
            for row in pending_rows:
                training_data = await self._extract_training_row_data(row)
                data['pending_trainings'].append(training_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de treinamentos: {e}")
            return {}

    async def _extract_reports_dashboard(self) -> Dict[str, Any]:
        """Extrai dados do dashboard de relatórios"""
        try:
            data = {
                'reports': [],
                'generated_reports': [],
                'scheduled_reports': []
            }
            
            # Extrair relatórios disponíveis
            report_elements = await self.page.query_selector_all('[data-testid="report-item"], .report-item')
            for element in report_elements:
                report_data = await self._extract_report_data(element)
                data['reports'].append(report_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de relatórios: {e}")
            return {}

    async def _extract_general_dashboard(self) -> Dict[str, Any]:
        """Extrai dados de dashboard geral"""
        try:
            data = {
                'kpis': {},
                'charts': {},
                'recent_activities': []
            }
            
            # Extrair KPIs
            kpi_elements = await self.page.query_selector_all('[data-testid="kpi"], .kpi')
            for element in kpi_elements:
                kpi_name = await element.get_attribute('data-kpi-name')
                kpi_value = await element.text_content()
                if kpi_name and kpi_value:
                    data['kpis'][kpi_name] = self._parse_metric_value(kpi_value)
            
            # Extrair atividades recentes
            activity_elements = await self.page.query_selector_all('[data-testid="activity-item"], .activity-item')
            for element in activity_elements:
                activity_data = await self._extract_activity_data(element)
                data['recent_activities'].append(activity_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados gerais: {e}")
            return {}

    async def _extract_chart_data(self) -> Dict[str, Any]:
        """Extrai dados de gráficos"""
        try:
            chart_data = {}
            
            # Tentar extrair dados de gráficos Canvas/SVG
            chart_elements = await self.page.query_selector_all('canvas, svg')
            
            for i, chart in enumerate(chart_elements):
                try:
                    # Tentar extrair dados via JavaScript
                    chart_info = await self.page.evaluate("""
                        (chart) => {
                            if (chart.chart) {
                                return {
                                    type: chart.chart.config.type,
                                    data: chart.chart.data,
                                    options: chart.chart.options
                                };
                            }
                            return null;
                        }
                    """, chart)
                    
                    if chart_info:
                        chart_data[f'chart_{i}'] = chart_info
                    
                except Exception as e:
                    logger.warning(f"Erro ao extrair gráfico {i}: {e}")
                    continue
            
            return chart_data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de gráficos: {e}")
            return {}

    async def _extract_table_data(self) -> List[Dict[str, Any]]:
        """Extrai dados de tabelas"""
        try:
            tables = []
            
            table_elements = await self.page.query_selector_all('table')
            
            for table in table_elements:
                try:
                    # Extrair cabeçalhos
                    headers = []
                    header_elements = await table.query_selector_all('th')
                    for header in header_elements:
                        header_text = await header.text_content()
                        headers.append(header_text.strip() if header_text else f"col_{len(headers)}")
                    
                    # Extrair linhas
                    rows = []
                    row_elements = await table.query_selector_all('tr')
                    
                    for row in row_elements[1:]:  # Pular cabeçalho
                        cells = await row.query_selector_all('td')
                        row_data = {}
                        
                        for i, cell in enumerate(cells):
                            cell_text = await cell.text_content()
                            header = headers[i] if i < len(headers) else f"col_{i}"
                            row_data[header] = cell_text.strip() if cell_text else ""
                        
                        if row_data:
                            rows.append(row_data)
                    
                    tables.append({
                        'headers': headers,
                        'rows': rows
                    })
                    
                except Exception as e:
                    logger.warning(f"Erro ao extrair tabela: {e}")
                    continue
            
            return tables
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de tabelas: {e}")
            return []

    async def _extract_alerts(self) -> List[Dict[str, Any]]:
        """Extrai alertas do dashboard"""
        try:
            alerts = []
            
            alert_elements = await self.page.query_selector_all('[data-testid="alert"], .alert, .notification')
            
            for alert in alert_elements:
                try:
                    alert_type = await alert.get_attribute('data-alert-type') or 'info'
                    alert_text = await alert.text_content()
                    
                    alerts.append({
                        'type': alert_type,
                        'message': alert_text.strip() if alert_text else "",
                        'timestamp': datetime.now().isoformat()
                    })
                    
                except Exception as e:
                    logger.warning(f"Erro ao extrair alerta: {e}")
                    continue
            
            return alerts
            
        except Exception as e:
            logger.error(f"Erro ao extrair alertas: {e}")
            return []

    def _parse_metric_value(self, value: str) -> Any:
        """Converte valor de métrica para tipo apropriado"""
        try:
            # Remover caracteres especiais
            clean_value = value.replace('%', '').replace(',', '').replace('R$', '').strip()
            
            # Tentar converter para número
            if '.' in clean_value:
                return float(clean_value)
            else:
                return int(clean_value)
        except:
            return value

    def _parse_percentage(self, value: str) -> float:
        """Converte porcentagem para float"""
        try:
            clean_value = value.replace('%', '').strip()
            return float(clean_value) / 100
        except:
            return 0.0

    async def analyze_dashboard_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa dados extraídos do dashboard"""
        try:
            analysis = {
                'insights': [],
                'anomalies': [],
                'trends': [],
                'recommendations': [],
                'summary': {}
            }
            
            # Converter dados para DataFrame se possível
            df = self._convert_to_dataframe(data)
            
            if df is not None and not df.empty:
                # Análise de tendências
                trends = self._analyze_trends(df)
                analysis['trends'] = trends
                
                # Detecção de anomalias
                anomalies = self._detect_anomalies(df)
                analysis['anomalies'] = anomalies
                
                # Geração de insights
                insights = self._generate_insights(df, data)
                analysis['insights'] = insights
                
                # Recomendações
                recommendations = self._generate_recommendations(df, data)
                analysis['recommendations'] = recommendations
            
            # Resumo estatístico
            analysis['summary'] = self._generate_summary(data)
            
            logger.info(f"Análise concluída: {len(analysis['insights'])} insights gerados")
            
            return {
                'success': True,
                'analysis': analysis,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na análise: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha na análise dos dados'
            }

    def _convert_to_dataframe(self, data: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Converte dados para DataFrame"""
        try:
            if 'tables' in data and data['tables']:
                # Usar primeira tabela
                table = data['tables'][0]
                return pd.DataFrame(table['rows'])
            
            elif 'inspections' in data and data['inspections']:
                return pd.DataFrame(data['inspections'])
            
            elif 'metrics' in data:
                # Converter métricas para DataFrame
                metrics_df = pd.DataFrame([data['metrics']])
                return metrics_df
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao converter para DataFrame: {e}")
            return None

    def _analyze_trends(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analisa tendências nos dados"""
        trends = []
        
        try:
            # Identificar colunas numéricas
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            for column in numeric_columns:
                if len(df[column].dropna()) > 1:
                    # Calcular tendência linear
                    x = np.arange(len(df[column].dropna()))
                    y = df[column].dropna().values
                    
                    if len(y) > 1:
                        slope, intercept = np.polyfit(x, y, 1)
                        
                        trend_type = "crescente" if slope > 0 else "decrescente" if slope < 0 else "estável"
                        strength = abs(slope)
                        
                        trends.append({
                            'metric': column,
                            'trend_type': trend_type,
                            'strength': strength,
                            'slope': slope,
                            'description': f"{column} mostra tendência {trend_type}"
                        })
            
        except Exception as e:
            logger.error(f"Erro na análise de tendências: {e}")
        
        return trends

    def _detect_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detecta anomalias nos dados"""
        anomalies = []
        
        try:
            # Identificar colunas numéricas
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            for column in numeric_columns:
                if len(df[column].dropna()) > 10:
                    # Usar Isolation Forest para detectar anomalias
                    values = df[column].dropna().values.reshape(-1, 1)
                    
                    iso_forest = IsolationForest(contamination=0.1, random_state=42)
                    predictions = iso_forest.fit_predict(values)
                    
                    # Encontrar anomalias
                    anomaly_indices = np.where(predictions == -1)[0]
                    
                    for idx in anomaly_indices:
                        anomalies.append({
                            'metric': column,
                            'value': values[idx][0],
                            'index': idx,
                            'description': f"Valor anômalo detectado em {column}: {values[idx][0]}"
                        })
            
        except Exception as e:
            logger.error(f"Erro na detecção de anomalias: {e}")
        
        return anomalies

    def _generate_insights(self, df: pd.DataFrame, raw_data: Dict[str, Any]) -> List[str]:
        """Gera insights baseados nos dados"""
        insights = []
        
        try:
            # Análise de métricas principais
            if 'metrics' in raw_data:
                metrics = raw_data['metrics']
                
                if 'approval_rate' in metrics:
                    rate = metrics['approval_rate']
                    if rate < 0.9:
                        insights.append(f"Taxa de aprovação baixa ({rate:.1%}). Revisar processos de qualidade.")
                    elif rate > 0.98:
                        insights.append(f"Excelente taxa de aprovação ({rate:.1%}). Manter padrões.")
                
                if 'rejection_rate' in metrics:
                    rate = metrics['rejection_rate']
                    if rate > 0.1:
                        insights.append(f"Taxa de rejeição alta ({rate:.1%}). Investigar causas raiz.")
            
            # Análise de tendências
            if len(df) > 5:
                # Verificar se há tendência de melhoria
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for col in numeric_cols:
                    if 'rate' in col.lower() or 'percentage' in col.lower():
                        recent_avg = df[col].tail(3).mean()
                        older_avg = df[col].head(3).mean()
                        
                        if recent_avg > older_avg * 1.05:
                            insights.append(f"Melhoria significativa em {col}: {older_avg:.1%} → {recent_avg:.1%}")
                        elif recent_avg < older_avg * 0.95:
                            insights.append(f"Queda preocupante em {col}: {older_avg:.1%} → {recent_avg:.1%}")
            
        except Exception as e:
            logger.error(f"Erro na geração de insights: {e}")
        
        return insights

    def _generate_recommendations(self, df: pd.DataFrame, raw_data: Dict[str, Any]) -> List[str]:
        """Gera recomendações baseadas na análise"""
        recommendations = []
        
        try:
            # Recomendações baseadas em métricas
            if 'metrics' in raw_data:
                metrics = raw_data['metrics']
                
                if 'approval_rate' in metrics and metrics['approval_rate'] < 0.9:
                    recommendations.append("Implementar treinamento adicional para inspetores")
                    recommendations.append("Revisar critérios de inspeção")
                
                if 'pending_inspections' in metrics and metrics['pending_inspections'] > 10:
                    recommendations.append("Aumentar capacidade de inspeção")
                    recommendations.append("Priorizar inspeções críticas")
            
            # Recomendações baseadas em anomalias
            if 'anomalies' in raw_data:
                anomaly_count = len(raw_data['anomalies'])
                if anomaly_count > 5:
                    recommendations.append("Investigar causas das anomalias detectadas")
                    recommendations.append("Implementar monitoramento contínuo")
            
            # Recomendações gerais
            if not recommendations:
                recommendations.append("Manter monitoramento regular dos indicadores")
                recommendations.append("Continuar com as práticas atuais")
            
        except Exception as e:
            logger.error(f"Erro na geração de recomendações: {e}")
        
        return recommendations

    def _generate_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Gera resumo estatístico dos dados"""
        summary = {}
        
        try:
            # Resumo de métricas
            if 'metrics' in data:
                summary['metrics_count'] = len(data['metrics'])
                summary['metrics'] = data['metrics']
            
            # Resumo de tabelas
            if 'tables' in data:
                summary['tables_count'] = len(data['tables'])
                total_rows = sum(len(table['rows']) for table in data['tables'])
                summary['total_rows'] = total_rows
            
            # Resumo de alertas
            if 'alerts' in data:
                summary['alerts_count'] = len(data['alerts'])
                summary['critical_alerts'] = len([a for a in data['alerts'] if a.get('type') == 'critical'])
            
            # Resumo de inspeções
            if 'inspections' in data:
                summary['inspections_count'] = len(data['inspections'])
            
        except Exception as e:
            logger.error(f"Erro na geração de resumo: {e}")
        
        return summary

    async def generate_dashboard_report(self, data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Gera relatório completo do dashboard"""
        try:
            report = {
                'generated_at': datetime.now().isoformat(),
                'dashboard_data': data,
                'analysis': analysis,
                'executive_summary': self._create_executive_summary(data, analysis),
                'detailed_analysis': self._create_detailed_analysis(data, analysis),
                'recommendations': analysis.get('recommendations', []),
                'next_steps': self._suggest_next_steps(analysis)
            }
            
            logger.info("Relatório de dashboard gerado com sucesso")
            
            return {
                'success': True,
                'report': report,
                'message': 'Relatório gerado com sucesso'
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao gerar relatório'
            }

    def _create_executive_summary(self, data: Dict[str, Any], analysis: Dict[str, Any]) -> str:
        """Cria resumo executivo"""
        summary = f"""
        **Resumo Executivo - Dashboard Analysis**
        
        **Data da Análise:** {datetime.now().strftime("%d/%m/%Y %H:%M")}
        
        **Principais Descobertas:**
        • {len(analysis.get('insights', []))} insights identificados
        • {len(analysis.get('anomalies', []))} anomalias detectadas
        • {len(analysis.get('trends', []))} tendências analisadas
        
        **Métricas Principais:**
        """
        
        if 'metrics' in data:
            for metric, value in data['metrics'].items():
                summary += f"• {metric}: {value}\n"
        
        summary += f"""
        
        **Recomendações Prioritárias:**
        """
        
        recommendations = analysis.get('recommendations', [])
        for i, rec in enumerate(recommendations[:3], 1):
            summary += f"{i}. {rec}\n"
        
        return summary

    def _create_detailed_analysis(self, data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Cria análise detalhada"""
        return {
            'trends_analysis': analysis.get('trends', []),
            'anomalies_detection': analysis.get('anomalies', []),
            'insights_generated': analysis.get('insights', []),
            'data_quality': self._assess_data_quality(data),
            'performance_metrics': self._calculate_performance_metrics(data)
        }

    def _assess_data_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Avalia qualidade dos dados"""
        quality_score = 0
        issues = []
        
        if 'metrics' in data and data['metrics']:
            quality_score += 30
        
        if 'tables' in data and data['tables']:
            quality_score += 40
        
        if 'charts' in data and data['charts']:
            quality_score += 30
        
        if quality_score < 50:
            issues.append("Dados insuficientes para análise completa")
        
        return {
            'score': quality_score,
            'issues': issues,
            'completeness': 'Completo' if quality_score > 80 else 'Parcial' if quality_score > 50 else 'Incompleto'
        }

    def _calculate_performance_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula métricas de performance"""
        metrics = {}
        
        if 'metrics' in data:
            metrics.update(data['metrics'])
        
        return metrics

    def _suggest_next_steps(self, analysis: Dict[str, Any]) -> List[str]:
        """Sugere próximos passos baseados na análise"""
        next_steps = []
        
        if analysis.get('anomalies'):
            next_steps.append("Investigar anomalias detectadas")
        
        if analysis.get('trends'):
            next_steps.append("Monitorar tendências identificadas")
        
        if analysis.get('recommendations'):
            next_steps.append("Implementar recomendações prioritárias")
        
        next_steps.append("Agendar próxima análise em 7 dias")
        
        return next_steps

async def main():
    """Função principal para testes"""
    # Carregar variáveis de ambiente
    load_dotenv()
    
    async with DashboardAnalyzer() as analyzer:
        # Login
        success = await analyzer.login(
            email=os.getenv('ADMIN_EMAIL', 'admin@enso.com'),
            password=os.getenv('ADMIN_PASSWORD', 'admin123')
        )
        
        if not success:
            logger.error("Falha no login")
            return
        
        # Filtros de exemplo
        filters = {
            'date_from': '2024-01-01',
            'date_to': '2024-12-31',
            'product': 'AFB001'
        }
        
        # Extrair dados do dashboard de qualidade
        result = await analyzer.extract_dashboard_data("quality", filters)
        
        if result['success']:
            logger.info(f"Dados extraídos: {len(result['data'])} registros")
            
            # Analisar dados
            analysis = await analyzer.analyze_dashboard_data(result['data'])
            
            if analysis['success']:
                logger.info(f"Análise concluída: {len(analysis['analysis']['insights'])} insights")
                
                # Gerar relatório
                report = await analyzer.generate_dashboard_report(result['data'], analysis['analysis'])
                logger.info(f"Relatório: {report}")
            else:
                logger.error(f"Erro na análise: {analysis['error']}")
        else:
            logger.error(f"Erro na extração: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main())
