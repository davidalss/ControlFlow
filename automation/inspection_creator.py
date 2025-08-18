#!/usr/bin/env python3
"""
Script de Criação Automática de Inspeções para o Severino Assistant
Usa Playwright para criar inspeções de forma autônoma
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

class InspectionCreator:
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

    async def create_inspection_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um plano de inspeção automaticamente"""
        try:
            logger.info(f"Criando plano de inspeção: {plan_data.get('name', 'Sem nome')}")
            
            # Navegar para página de criação de planos
            await self.page.goto(f"{self.base_url}/inspection-plans")
            await self.page.wait_for_load_state('networkidle')
            
            # Clicar no botão "Novo Plano"
            await self.page.click('button[data-testid="new-plan-button"], button:has-text("Novo Plano")')
            await self.page.wait_for_load_state('networkidle')
            
            # Preencher dados básicos do plano
            await self._fill_basic_plan_data(plan_data)
            
            # Configurar critérios AQL
            await self._configure_aql_criteria(plan_data.get('aql_criteria', {}))
            
            # Adicionar etapas de inspeção
            await self._add_inspection_steps(plan_data.get('steps', []))
            
            # Configurar campos obrigatórios
            await self._configure_required_fields(plan_data.get('required_fields', []))
            
            # Salvar plano
            await self.page.click('button[type="submit"], button:has-text("Salvar")')
            
            # Aguardar confirmação
            await self.page.wait_for_selector('.success-message, .toast-success', timeout=10000)
            
            # Extrair ID do plano criado
            plan_id = await self._extract_plan_id()
            
            logger.info(f"Plano de inspeção criado com sucesso. ID: {plan_id}")
            
            return {
                'success': True,
                'plan_id': plan_id,
                'message': 'Plano de inspeção criado com sucesso',
                'data': plan_data
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar plano de inspeção: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao criar plano de inspeção'
            }

    async def _fill_basic_plan_data(self, plan_data: Dict[str, Any]):
        """Preenche dados básicos do plano"""
        try:
            # Nome do plano
            if 'name' in plan_data:
                await self.page.fill('input[name="name"], input[placeholder*="nome"]', plan_data['name'])
            
            # Descrição
            if 'description' in plan_data:
                await self.page.fill('textarea[name="description"], textarea[placeholder*="descrição"]', plan_data['description'])
            
            # Produto
            if 'product_code' in plan_data:
                await self.page.click('select[name="product"], [data-testid="product-selector"]')
                await self.page.click(f'option[value="{plan_data["product_code"]}"], [data-testid="product-{plan_data["product_code"]}"]')
            
            # Categoria
            if 'category' in plan_data:
                await self.page.select_option('select[name="category"]', plan_data['category'])
            
            # Nível de inspeção
            if 'inspection_level' in plan_data:
                await self.page.select_option('select[name="inspection_level"]', plan_data['inspection_level'])
                
        except Exception as e:
            logger.error(f"Erro ao preencher dados básicos: {e}")
            raise

    async def _configure_aql_criteria(self, aql_data: Dict[str, Any]):
        """Configura critérios AQL"""
        try:
            # Navegar para aba de critérios AQL
            await self.page.click('[data-testid="aql-tab"], a:has-text("Critérios AQL")')
            
            # Critério crítico
            if 'critical' in aql_data:
                await self.page.fill('input[name="critical_aql"]', str(aql_data['critical']))
            
            # Critério maior
            if 'major' in aql_data:
                await self.page.fill('input[name="major_aql"]', str(aql_data['major']))
            
            # Critério menor
            if 'minor' in aql_data:
                await self.page.fill('input[name="minor_aql"]', str(aql_data['minor']))
            
            # Tamanho do lote
            if 'lot_size' in aql_data:
                await self.page.fill('input[name="lot_size"]', str(aql_data['lot_size']))
                
        except Exception as e:
            logger.error(f"Erro ao configurar critérios AQL: {e}")
            raise

    async def _add_inspection_steps(self, steps: List[Dict[str, Any]]):
        """Adiciona etapas de inspeção"""
        try:
            # Navegar para aba de etapas
            await self.page.click('[data-testid="steps-tab"], a:has-text("Etapas")')
            
            for i, step in enumerate(steps):
                # Clicar em "Adicionar Etapa"
                await self.page.click('button:has-text("Adicionar Etapa"), [data-testid="add-step-button"]')
                
                # Preencher nome da etapa
                await self.page.fill(f'input[name="steps[{i}].name"]', step.get('name', f'Etapa {i+1}'))
                
                # Preencher descrição
                if 'description' in step:
                    await self.page.fill(f'textarea[name="steps[{i}].description"]', step['description'])
                
                # Configurar campos obrigatórios
                if 'required_fields' in step:
                    for field in step['required_fields']:
                        await self.page.check(f'input[name="steps[{i}].fields.{field}"]')
                
                # Configurar fotos obrigatórias
                if step.get('photos_required', False):
                    await self.page.check(f'input[name="steps[{i}].photos_required"]')
                    
        except Exception as e:
            logger.error(f"Erro ao adicionar etapas: {e}")
            raise

    async def _configure_required_fields(self, fields: List[str]):
        """Configura campos obrigatórios"""
        try:
            # Navegar para aba de campos
            await self.page.click('[data-testid="fields-tab"], a:has-text("Campos")')
            
            for field in fields:
                await self.page.check(f'input[name="required_fields.{field}"]')
                
        except Exception as e:
            logger.error(f"Erro ao configurar campos obrigatórios: {e}")
            raise

    async def _extract_plan_id(self) -> str:
        """Extrai o ID do plano criado"""
        try:
            # Tentar extrair da URL
            current_url = self.page.url
            if '/inspection-plans/' in current_url:
                return current_url.split('/')[-1]
            
            # Tentar extrair de elementos da página
            plan_id_element = await self.page.query_selector('[data-testid="plan-id"], .plan-id')
            if plan_id_element:
                return await plan_id_element.text_content()
            
            # Gerar ID temporário
            return f"plan_{int(time.time())}"
            
        except Exception as e:
            logger.error(f"Erro ao extrair ID do plano: {e}")
            return f"plan_{int(time.time())}"

    async def create_inspection_from_plan(self, plan_id: str, inspection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma inspeção baseada em um plano existente"""
        try:
            logger.info(f"Criando inspeção do plano: {plan_id}")
            
            # Navegar para página de inspeções
            await self.page.goto(f"{self.base_url}/inspections")
            await self.page.wait_for_load_state('networkidle')
            
            # Clicar em "Nova Inspeção"
            await self.page.click('button[data-testid="new-inspection-button"], button:has-text("Nova Inspeção")')
            
            # Selecionar plano
            await self.page.click(f'[data-testid="plan-{plan_id}"], [data-value="{plan_id}"]')
            
            # Preencher dados da inspeção
            await self._fill_inspection_data(inspection_data)
            
            # Iniciar inspeção
            await self.page.click('button:has-text("Iniciar Inspeção"), [data-testid="start-inspection"]')
            
            # Aguardar confirmação
            await self.page.wait_for_selector('.success-message, .toast-success', timeout=10000)
            
            # Extrair ID da inspeção
            inspection_id = await self._extract_inspection_id()
            
            logger.info(f"Inspeção criada com sucesso. ID: {inspection_id}")
            
            return {
                'success': True,
                'inspection_id': inspection_id,
                'plan_id': plan_id,
                'message': 'Inspeção criada com sucesso',
                'data': inspection_data
            }
            
        except Exception as e:
            logger.error(f"Erro ao criar inspeção: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Falha ao criar inspeção'
            }

    async def _fill_inspection_data(self, inspection_data: Dict[str, Any]):
        """Preenche dados da inspeção"""
        try:
            # Lote
            if 'lot_number' in inspection_data:
                await self.page.fill('input[name="lot_number"]', inspection_data['lot_number'])
            
            # Quantidade
            if 'quantity' in inspection_data:
                await self.page.fill('input[name="quantity"]', str(inspection_data['quantity']))
            
            # Inspetor
            if 'inspector' in inspection_data:
                await self.page.fill('input[name="inspector"]', inspection_data['inspector'])
            
            # Data
            if 'inspection_date' in inspection_data:
                await self.page.fill('input[name="inspection_date"]', inspection_data['inspection_date'])
                
        except Exception as e:
            logger.error(f"Erro ao preencher dados da inspeção: {e}")
            raise

    async def _extract_inspection_id(self) -> str:
        """Extrai o ID da inspeção criada"""
        try:
            # Tentar extrair da URL
            current_url = self.page.url
            if '/inspections/' in current_url:
                return current_url.split('/')[-1]
            
            # Tentar extrair de elementos da página
            inspection_id_element = await self.page.query_selector('[data-testid="inspection-id"], .inspection-id')
            if inspection_id_element:
                return await inspection_id_element.text_content()
            
            # Gerar ID temporário
            return f"inspection_{int(time.time())}"
            
        except Exception as e:
            logger.error(f"Erro ao extrair ID da inspeção: {e}")
            return f"inspection_{int(time.time())}"

    async def validate_form(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Valida formulário antes de submeter"""
        try:
            validation_errors = []
            
            # Validar campos obrigatórios
            required_fields = ['name', 'product_code', 'inspection_level']
            for field in required_fields:
                if field not in form_data or not form_data[field]:
                    validation_errors.append(f"Campo obrigatório: {field}")
            
            # Validar critérios AQL
            if 'aql_criteria' in form_data:
                aql = form_data['aql_criteria']
                if 'lot_size' in aql and aql['lot_size'] <= 0:
                    validation_errors.append("Tamanho do lote deve ser maior que zero")
            
            # Validar etapas
            if 'steps' in form_data and not form_data['steps']:
                validation_errors.append("Pelo menos uma etapa deve ser definida")
            
            return {
                'valid': len(validation_errors) == 0,
                'errors': validation_errors,
                'message': 'Formulário válido' if len(validation_errors) == 0 else 'Formulário com erros'
            }
            
        except Exception as e:
            logger.error(f"Erro na validação: {e}")
            return {
                'valid': False,
                'errors': [str(e)],
                'message': 'Erro na validação'
            }

async def main():
    """Função principal para testes"""
    # Carregar variáveis de ambiente
    load_dotenv()
    
    # Dados de exemplo para teste
    test_plan_data = {
        'name': 'Plano de Inspeção - Air Fryer',
        'description': 'Plano de inspeção para Air Fryer modelo AFB001',
        'product_code': 'AFB001',
        'category': 'Eletrodomésticos',
        'inspection_level': 'II',
        'aql_criteria': {
            'critical': 0.065,
            'major': 1.0,
            'minor': 2.5,
            'lot_size': 1000
        },
        'steps': [
            {
                'name': 'Inspeção Visual',
                'description': 'Verificar aparência externa do produto',
                'required_fields': ['defects_found', 'photos'],
                'photos_required': True
            },
            {
                'name': 'Teste Funcional',
                'description': 'Verificar funcionamento básico',
                'required_fields': ['functional_test', 'temperature_test'],
                'photos_required': False
            }
        ],
        'required_fields': ['inspector', 'date', 'lot_number']
    }
    
    async with InspectionCreator() as creator:
        # Login
        success = await creator.login(
            email=os.getenv('ADMIN_EMAIL', 'admin@enso.com'),
            password=os.getenv('ADMIN_PASSWORD', 'admin123')
        )
        
        if not success:
            logger.error("Falha no login")
            return
        
        # Validar formulário
        validation = await creator.validate_form(test_plan_data)
        logger.info(f"Validação: {validation}")
        
        if validation['valid']:
            # Criar plano
            result = await creator.create_inspection_plan(test_plan_data)
            logger.info(f"Resultado: {result}")
        else:
            logger.error(f"Formulário inválido: {validation['errors']}")

if __name__ == "__main__":
    asyncio.run(main())
