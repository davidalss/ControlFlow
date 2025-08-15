#!/usr/bin/env python3
"""
Script de Verificação de Treinamentos para o Severino Assistant
Verifica status de treinamentos e envia alertas automáticos
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Browser, Page, BrowserContext
import pandas as pd
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TrainingChecker:
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

    async def check_training_status(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Verifica status de treinamentos"""
        try:
            logger.info("Verificando status de treinamentos")
            
            # Navegar para página de treinamentos
            await self.page.goto(f"{self.base_url}/training")
            await self.page.wait_for_load_state('networkidle')
            
            # Aplicar filtros se fornecidos
            if filters:
                await self._apply_filters(filters)
            
            # Extrair dados de treinamentos
            training_data = await self._extract_training_data()
            
            # Analisar status
            analysis = self._analyze_training_status(training_data)
            
            logger.info(f"Verificação concluída. {len(analysis['pending'])} treinamentos pendentes")
            
            return {
                'success': True,
                'data': training_data,
                'analysis': analysis,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao verificar treinamentos: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao verificar treinamentos'
            }

    async def _apply_filters(self, filters: Dict[str, Any]):
        """Aplica filtros na página de treinamentos"""
        try:
            # Filtro por equipe
            if 'team' in filters:
                await self.page.select_option('select[name="team"]', filters['team'])
            
            # Filtro por status
            if 'status' in filters:
                await self.page.select_option('select[name="status"]', filters['status'])
            
            # Filtro por período
            if 'date_from' in filters:
                await self.page.fill('input[name="date_from"]', filters['date_from'])
            
            if 'date_to' in filters:
                await self.page.fill('input[name="date_to"]', filters['date_to'])
            
            # Aplicar filtros
            await self.page.click('button:has-text("Aplicar Filtros"), [data-testid="apply-filters"]')
            await self.page.wait_for_load_state('networkidle')
            
        except Exception as e:
            logger.error(f"Erro ao aplicar filtros: {e}")
            raise

    async def _extract_training_data(self) -> List[Dict[str, Any]]:
        """Extrai dados de treinamentos da página"""
        try:
            training_data = []
            
            # Encontrar todas as linhas de treinamento
            training_rows = await self.page.query_selector_all('tr[data-testid="training-row"], .training-row')
            
            for row in training_rows:
                try:
                    # Extrair dados da linha
                    employee = await row.query_selector('[data-testid="employee-name"], .employee-name')
                    employee_name = await employee.text_content() if employee else "N/A"
                    
                    course = await row.query_selector('[data-testid="course-name"], .course-name')
                    course_name = await course.text_content() if course else "N/A"
                    
                    status = await row.query_selector('[data-testid="training-status"], .training-status')
                    status_text = await status.text_content() if status else "N/A"
                    
                    due_date = await row.query_selector('[data-testid="due-date"], .due-date')
                    due_date_text = await due_date.text_content() if due_date else "N/A"
                    
                    progress = await row.query_selector('[data-testid="progress"], .progress')
                    progress_text = await progress.text_content() if progress else "0%"
                    
                    # Converter data
                    due_date_obj = None
                    if due_date_text and due_date_text != "N/A":
                        try:
                            due_date_obj = datetime.strptime(due_date_text, "%d/%m/%Y")
                        except:
                            due_date_obj = datetime.now() + timedelta(days=30)  # Default
                    
                    training_data.append({
                        'employee_name': employee_name.strip(),
                        'course_name': course_name.strip(),
                        'status': status_text.strip(),
                        'due_date': due_date_text.strip(),
                        'due_date_obj': due_date_obj,
                        'progress': progress_text.strip(),
                        'days_remaining': self._calculate_days_remaining(due_date_obj)
                    })
                    
                except Exception as e:
                    logger.warning(f"Erro ao extrair dados da linha: {e}")
                    continue
            
            return training_data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de treinamentos: {e}")
            return []

    def _calculate_days_remaining(self, due_date: datetime) -> int:
        """Calcula dias restantes até o vencimento"""
        if not due_date:
            return 999  # Sem data definida
        
        days_remaining = (due_date - datetime.now()).days
        return max(0, days_remaining)

    def _analyze_training_status(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analisa status dos treinamentos"""
        try:
            analysis = {
                'total': len(training_data),
                'completed': [],
                'in_progress': [],
                'pending': [],
                'overdue': [],
                'expiring_soon': [],
                'alerts': []
            }
            
            for training in training_data:
                status = training['status'].lower()
                days_remaining = training['days_remaining']
                
                if 'concluído' in status or 'completed' in status:
                    analysis['completed'].append(training)
                elif 'em andamento' in status or 'in progress' in status:
                    analysis['in_progress'].append(training)
                elif 'pendente' in status or 'pending' in status:
                    analysis['pending'].append(training)
                    
                    # Verificar se está vencendo em breve
                    if days_remaining <= 7:
                        analysis['expiring_soon'].append(training)
                        analysis['alerts'].append({
                            'type': 'expiring_soon',
                            'message': f"Treinamento de {training['employee_name']} vence em {days_remaining} dias",
                            'training': training
                        })
                elif 'vencido' in status or 'overdue' in status or days_remaining < 0:
                    analysis['overdue'].append(training)
                    analysis['alerts'].append({
                        'type': 'overdue',
                        'message': f"Treinamento de {training['employee_name']} está vencido há {abs(days_remaining)} dias",
                        'training': training
                    })
            
            # Estatísticas
            analysis['stats'] = {
                'completion_rate': (len(analysis['completed']) / len(training_data)) * 100 if training_data else 0,
                'overdue_rate': (len(analysis['overdue']) / len(training_data)) * 100 if training_data else 0,
                'expiring_soon_count': len(analysis['expiring_soon'])
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Erro ao analisar status: {e}")
            return {
                'total': 0,
                'completed': [],
                'in_progress': [],
                'pending': [],
                'overdue': [],
                'expiring_soon': [],
                'alerts': [],
                'stats': {}
            }

    async def send_training_alerts(self, analysis: Dict[str, Any], alert_config: Dict[str, Any]) -> Dict[str, Any]:
        """Envia alertas de treinamentos"""
        try:
            alerts_sent = []
            
            # Alertas por email
            if alert_config.get('email_enabled', False):
                email_alerts = await self._send_email_alerts(analysis, alert_config)
                alerts_sent.extend(email_alerts)
            
            # Alertas por Slack/Teams (implementar quando necessário)
            if alert_config.get('slack_enabled', False):
                slack_alerts = await self._send_slack_alerts(analysis, alert_config)
                alerts_sent.extend(slack_alerts)
            
            # Alertas por WebSocket
            if alert_config.get('websocket_enabled', False):
                websocket_alerts = await self._send_websocket_alerts(analysis, alert_config)
                alerts_sent.extend(websocket_alerts)
            
            logger.info(f"Alertas enviados: {len(alerts_sent)}")
            
            return {
                'success': True,
                'alerts_sent': alerts_sent,
                'message': f"{len(alerts_sent)} alertas enviados com sucesso"
            }
            
        except Exception as e:
            logger.error(f"Erro ao enviar alertas: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao enviar alertas'
            }

    async def _send_email_alerts(self, analysis: Dict[str, Any], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Envia alertas por email"""
        alerts_sent = []
        
        try:
            # Configurações de email
            smtp_server = config.get('smtp_server', 'smtp.gmail.com')
            smtp_port = config.get('smtp_port', 587)
            email_from = config.get('email_from', 'severino@controlflow.com')
            email_password = config.get('email_password', '')
            recipients = config.get('recipients', [])
            
            if not recipients:
                logger.warning("Nenhum destinatário configurado para email")
                return alerts_sent
            
            # Criar mensagem
            subject = "🚨 Alertas de Treinamentos - ControlFlow"
            
            # Corpo do email
            body = self._create_email_body(analysis)
            
            # Enviar email
            msg = MIMEMultipart()
            msg['From'] = email_from
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'html'))
            
            # Conectar e enviar
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(email_from, email_password)
            
            text = msg.as_string()
            server.sendmail(email_from, recipients, text)
            server.quit()
            
            alerts_sent.append({
                'type': 'email',
                'recipients': recipients,
                'subject': subject,
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info(f"Email enviado para {len(recipients)} destinatários")
            
        except Exception as e:
            logger.error(f"Erro ao enviar email: {e}")
        
        return alerts_sent

    def _create_email_body(self, analysis: Dict[str, Any]) -> str:
        """Cria corpo do email com alertas"""
        html = """
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .alert { background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
                .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
                .info { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 10px; margin: 10px 0; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>🚨 Relatório de Treinamentos - ControlFlow</h2>
            <p><strong>Data:</strong> {date}</p>
            
            <div class="info">
                <h3>📊 Resumo</h3>
                <ul>
                    <li><strong>Total de treinamentos:</strong> {total}</li>
                    <li><strong>Concluídos:</strong> {completed}</li>
                    <li><strong>Em andamento:</strong> {in_progress}</li>
                    <li><strong>Pendentes:</strong> {pending}</li>
                    <li><strong>Vencidos:</strong> {overdue}</li>
                    <li><strong>Vencendo em breve:</strong> {expiring_soon}</li>
                </ul>
            </div>
        """.format(
            date=datetime.now().strftime("%d/%m/%Y %H:%M"),
            total=analysis['total'],
            completed=len(analysis['completed']),
            in_progress=len(analysis['in_progress']),
            pending=len(analysis['pending']),
            overdue=len(analysis['overdue']),
            expiring_soon=len(analysis['expiring_soon'])
        )
        
        # Alertas críticos
        if analysis['overdue']:
            html += """
            <div class="alert">
                <h3>🚨 Treinamentos Vencidos</h3>
                <table>
                    <tr><th>Funcionário</th><th>Curso</th><th>Dias Vencido</th></tr>
            """
            for training in analysis['overdue']:
                html += f"""
                    <tr>
                        <td>{training['employee_name']}</td>
                        <td>{training['course_name']}</td>
                        <td>{abs(training['days_remaining'])} dias</td>
                    </tr>
                """
            html += "</table></div>"
        
        # Alertas de vencimento próximo
        if analysis['expiring_soon']:
            html += """
            <div class="warning">
                <h3>⚠️ Treinamentos Vencendo em Breve</h3>
                <table>
                    <tr><th>Funcionário</th><th>Curso</th><th>Dias Restantes</th></tr>
            """
            for training in analysis['expiring_soon']:
                html += f"""
                    <tr>
                        <td>{training['employee_name']}</td>
                        <td>{training['course_name']}</td>
                        <td>{training['days_remaining']} dias</td>
                    </tr>
                """
            html += "</table></div>"
        
        html += """
        <p><em>Este relatório foi gerado automaticamente pelo Severino Assistant.</em></p>
        </body>
        </html>
        """
        
        return html

    async def _send_slack_alerts(self, analysis: Dict[str, Any], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Envia alertas para Slack (placeholder)"""
        # Implementar quando necessário
        logger.info("Integração com Slack não implementada ainda")
        return []

    async def _send_websocket_alerts(self, analysis: Dict[str, Any], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Envia alertas via WebSocket"""
        alerts_sent = []
        
        try:
            # Enviar para WebSocket server
            websocket_url = config.get('websocket_url', 'ws://localhost:5001')
            
            # Aqui você implementaria a lógica de WebSocket
            # Por enquanto, apenas log
            for alert in analysis['alerts']:
                logger.info(f"WebSocket Alert: {alert['message']}")
                alerts_sent.append({
                    'type': 'websocket',
                    'message': alert['message'],
                    'timestamp': datetime.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Erro ao enviar alertas WebSocket: {e}")
        
        return alerts_sent

    async def generate_training_report(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Gera relatório de treinamentos"""
        try:
            report = {
                'generated_at': datetime.now().isoformat(),
                'summary': {
                    'total_trainings': analysis['total'],
                    'completion_rate': analysis['stats'].get('completion_rate', 0),
                    'overdue_rate': analysis['stats'].get('overdue_rate', 0),
                    'expiring_soon_count': analysis['stats'].get('expiring_soon_count', 0)
                },
                'details': {
                    'completed': len(analysis['completed']),
                    'in_progress': len(analysis['in_progress']),
                    'pending': len(analysis['pending']),
                    'overdue': len(analysis['overdue'])
                },
                'alerts': analysis['alerts'],
                'recommendations': self._generate_recommendations(analysis)
            }
            
            logger.info("Relatório de treinamentos gerado com sucesso")
            
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

    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Gera recomendações baseadas na análise"""
        recommendations = []
        
        if analysis['stats'].get('overdue_rate', 0) > 10:
            recommendations.append("Taxa de treinamentos vencidos alta. Implementar processo de acompanhamento mais rigoroso.")
        
        if analysis['stats'].get('expiring_soon_count', 0) > 5:
            recommendations.append("Muitos treinamentos vencendo em breve. Agendar sessões de reciclagem.")
        
        if analysis['stats'].get('completion_rate', 0) < 80:
            recommendations.append("Taxa de conclusão baixa. Revisar metodologia de treinamento.")
        
        if not recommendations:
            recommendations.append("Status dos treinamentos está adequado. Manter acompanhamento regular.")
        
        return recommendations

async def main():
    """Função principal para testes"""
    # Carregar variáveis de ambiente
    load_dotenv()
    
    # Configuração de alertas
    alert_config = {
        'email_enabled': True,
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'email_from': 'severino@controlflow.com',
        'email_password': os.getenv('EMAIL_PASSWORD', ''),
        'recipients': ['admin@controlflow.com'],
        'slack_enabled': False,
        'websocket_enabled': True,
        'websocket_url': 'ws://localhost:5001'
    }
    
    async with TrainingChecker() as checker:
        # Login
        success = await checker.login(
            email=os.getenv('ADMIN_EMAIL', 'admin@controlflow.com'),
            password=os.getenv('ADMIN_PASSWORD', 'admin123')
        )
        
        if not success:
            logger.error("Falha no login")
            return
        
        # Verificar treinamentos
        result = await checker.check_training_status()
        
        if result['success']:
            logger.info(f"Verificação concluída: {result['analysis']['total']} treinamentos encontrados")
            
            # Gerar relatório
            report = await checker.generate_training_report(result['analysis'])
            logger.info(f"Relatório: {report}")
            
            # Enviar alertas se houver
            if result['analysis']['alerts']:
                alerts = await checker.send_training_alerts(result['analysis'], alert_config)
                logger.info(f"Alertas: {alerts}")
        else:
            logger.error(f"Erro na verificação: {result['error']}")

if __name__ == "__main__":
    asyncio.run(main())
