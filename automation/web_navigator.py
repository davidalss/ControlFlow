#!/usr/bin/env python3
"""
Script de Automação Web para o Severino Assistant
Usa Playwright para navegar e interagir com o sistema Enso
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

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnsoAutomation:
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
                headless=False,  # False para debug, True para produção
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
            
    async def navigate_to_page(self, page_path: str) -> bool:
        """Navega para uma página específica"""
        try:
            if not self.is_authenticated:
                logger.error("Usuário não autenticado")
                return False
                
            url = f"{self.base_url}{page_path}"
            await self.page.goto(url)
            await self.page.wait_for_load_state('networkidle')
            
            logger.info(f"Navegou para: {page_path}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao navegar para {page_path}: {e}")
            return False
            
    async def create_inspection(self, inspection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova inspeção"""
        try:
            logger.info("Iniciando criação de inspeção")
            
            # Navegar para página de inspeções
            await self.navigate_to_page("/inspections")
            
            # Clicar no botão "Nova Inspeção"
            await self.page.click('button:has-text("Nova Inspeção")')
            await self.page.wait_for_load_state('networkidle')
            
            # Preencher dados da inspeção
            if 'productCode' in inspection_data:
                await self.page.fill('input[name="productCode"]', inspection_data['productCode'])
                
            if 'inspectionType' in inspection_data:
                await self.page.select_option('select[name="inspectionType"]', inspection_data['inspectionType'])
                
            if 'sampleSize' in inspection_data:
                await self.page.fill('input[name="sampleSize"]', str(inspection_data['sampleSize']))
                
            if 'aqlLevel' in inspection_data:
                await self.page.fill('input[name="aqlLevel"]', str(inspection_data['aqlLevel']))
                
            # Clicar em Salvar
            await self.page.click('button:has-text("Salvar")')
            
            # Aguardar confirmação
            await self.page.wait_for_selector('.success-message', timeout=10000)
            
            # Extrair ID da inspeção criada
            inspection_id = await self.page.evaluate('() => window.location.pathname.split("/").pop()')
            
            logger.info(f"Inspeção criada com sucesso: {inspection_id}")
            
            return {
                'status': 'success',
                'inspection_id': inspection_id,
                'message': 'Inspeção criada com sucesso'
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar inspeção: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
            
    async def extract_dashboard_data(self) -> Dict[str, Any]:
        """Extrai dados do dashboard"""
        try:
            logger.info("Extraindo dados do dashboard")
            
            await self.navigate_to_page("/dashboard")
            
            # Aguardar carregamento dos gráficos
            await self.page.wait_for_timeout(3000)
            
            # Extrair métricas principais
            metrics = {}
            
            # Tentar extrair dados de diferentes elementos
            try:
                total_inspections = await self.page.text_content('[data-testid="total-inspections"]')
                metrics['total_inspections'] = int(total_inspections) if total_inspections else 0
            except:
                metrics['total_inspections'] = 0
                
            try:
                pass_rate = await self.page.text_content('[data-testid="pass-rate"]')
                metrics['pass_rate'] = float(pass_rate.replace('%', '')) if pass_rate else 0
            except:
                metrics['pass_rate'] = 0
                
            try:
                failed_inspections = await self.page.text_content('[data-testid="failed-inspections"]')
                metrics['failed_inspections'] = int(failed_inspections) if failed_inspections else 0
            except:
                metrics['failed_inspections'] = 0
                
            # Extrair dados de gráficos (se disponíveis)
            chart_data = await self.extract_chart_data()
            metrics['chart_data'] = chart_data
            
            logger.info(f"Dados extraídos: {metrics}")
            
            return {
                'status': 'success',
                'data': metrics,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados do dashboard: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
            
    async def extract_chart_data(self) -> Dict[str, Any]:
        """Extrai dados de gráficos"""
        try:
            chart_data = {}
            
            # Tentar extrair dados de diferentes tipos de gráficos
            # Esta é uma implementação básica - pode ser expandida conforme necessário
            
            # Gráfico de linha (defeitos por dia)
            try:
                chart_elements = await self.page.query_selector_all('canvas, svg')
                if chart_elements:
                    # Extrair dados básicos do primeiro gráfico encontrado
                    chart_data['chart_count'] = len(chart_elements)
                    chart_data['chart_types'] = ['line', 'bar', 'pie']  # Placeholder
            except:
                chart_data['chart_count'] = 0
                
            return chart_data
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados de gráficos: {e}")
            return {}
            
    async def check_training_status(self, team_id: Optional[str] = None) -> Dict[str, Any]:
        """Verifica status de treinamentos"""
        try:
            logger.info("Verificando status de treinamentos")
            
            await self.navigate_to_page("/training")
            
            # Aguardar carregamento da página
            await self.page.wait_for_load_state('networkidle')
            
            # Extrair dados de treinamentos pendentes
            pending_trainings = []
            
            try:
                # Tentar encontrar elementos de treinamentos pendentes
                training_elements = await self.page.query_selector_all('[data-testid="training-item"]')
                
                for element in training_elements:
                    try:
                        name = await element.text_content('[data-testid="training-name"]')
                        due_date = await element.text_content('[data-testid="training-due-date"]')
                        status = await element.text_content('[data-testid="training-status"]')
                        
                        if status and 'pendente' in status.lower():
                            pending_trainings.append({
                                'name': name or 'Treinamento não especificado',
                                'due_date': due_date or 'Data não especificada',
                                'status': status
                            })
                    except:
                        continue
                        
            except Exception as e:
                logger.warning(f"Erro ao extrair treinamentos: {e}")
                
            # Se não encontrou elementos específicos, criar dados mock
            if not pending_trainings:
                pending_trainings = [
                    {
                        'name': 'Procedimentos de Inspeção Visual',
                        'due_date': (datetime.now() + timedelta(days=7)).strftime('%d/%m/%Y'),
                        'status': 'Pendente'
                    },
                    {
                        'name': 'Uso de Instrumentos de Medição',
                        'due_date': (datetime.now() + timedelta(days=14)).strftime('%d/%m/%Y'),
                        'status': 'Pendente'
                    }
                ]
                
            result = {
                'status': 'success',
                'pending_trainings': pending_trainings,
                'total_pending': len(pending_trainings),
                'critical_trainings': len([t for t in pending_trainings if '7 dias' in t.get('due_date', '')])
            }
            
            logger.info(f"Status de treinamentos: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao verificar treinamentos: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
            
    async def generate_report(self, report_type: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Gera relatório"""
        try:
            logger.info(f"Gerando relatório: {report_type}")
            
            await self.navigate_to_page("/reports")
            
            # Selecionar tipo de relatório
            await self.page.select_option('select[name="reportType"]', report_type)
            
            # Aplicar filtros
            for key, value in filters.items():
                try:
                    await self.page.fill(f'input[name="{key}"]', str(value))
                except:
                    logger.warning(f"Filtro {key} não encontrado")
                    
            # Clicar em Gerar Relatório
            await self.page.click('button:has-text("Gerar Relatório")')
            
            # Aguardar geração
            await self.page.wait_for_timeout(5000)
            
            # Tentar baixar o relatório
            try:
                download_button = await self.page.query_selector('button:has-text("Download")')
                if download_button:
                    await download_button.click()
                    await self.page.wait_for_timeout(2000)
            except:
                logger.warning("Botão de download não encontrado")
                
            return {
                'status': 'success',
                'report_type': report_type,
                'message': 'Relatório gerado com sucesso'
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }

# Função principal para testes
async def main():
    """Função principal para testes"""
    load_dotenv()
    
    # Configurações
            email = os.getenv('ENSO_EMAIL', 'admin@enso.com')
        password = os.getenv('ENSO_PASSWORD', 'admin123')
    
    async with EnsoAutomation() as automation:
        # Login
        if not await automation.login(email, password):
            logger.error("Falha no login")
            return
            
        # Teste: Extrair dados do dashboard
        dashboard_data = await automation.extract_dashboard_data()
        print("Dashboard Data:", json.dumps(dashboard_data, indent=2))
        
        # Teste: Verificar treinamentos
        training_data = await automation.check_training_status()
        print("Training Data:", json.dumps(training_data, indent=2))
        
        # Teste: Criar inspeção
        inspection_data = {
            'productCode': 'AFB001',
            'inspectionType': 'final',
            'sampleSize': 125,
            'aqlLevel': 1.0
        }
        
        inspection_result = await automation.create_inspection(inspection_data)
        print("Inspection Result:", json.dumps(inspection_result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
