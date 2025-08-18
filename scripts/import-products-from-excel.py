#!/usr/bin/env python3
"""
Script para importar produtos do arquivo Excel para o Supabase
"""

import pandas as pd
import json
import os
import sys
from supabase import create_client, Client
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

# Configuração do Supabase
SUPABASE_URL = "https://smvohmdytczfouslcaju.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzE5NzI5MCwiZXhwIjoyMDUyNzczMjkwfQ.ExieAFZE1Xb3oyfh"

def connect_to_supabase() -> Client:
    """Conecta ao Supabase"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Conectado ao Supabase com sucesso!")
        return supabase
    except Exception as e:
        print(f"❌ Erro ao conectar ao Supabase: {e}")
        sys.exit(1)

def read_excel_file(file_path: str) -> pd.DataFrame:
    """Lê o arquivo Excel"""
    try:
        print(f"📖 Lendo arquivo: {file_path}")
        df = pd.read_excel(file_path)
        print(f"✅ Arquivo lido com sucesso! {len(df)} linhas encontradas")
        print(f"📊 Colunas: {list(df.columns)}")
        return df
    except Exception as e:
        print(f"❌ Erro ao ler arquivo Excel: {e}")
        sys.exit(1)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Limpa e prepara os dados"""
    print("🧹 Limpando dados...")
    
    # Remove linhas completamente vazias
    df = df.dropna(how='all')
    
    # Substitui NaN por None para campos opcionais
    df = df.where(pd.notnull(df), None)
    
    # Converte tipos de dados
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str)
    
    print(f"✅ Dados limpos! {len(df)} linhas válidas")
    return df

def map_business_unit(business_unit: str) -> str:
    """Mapeia a unidade de negócio para os valores aceitos"""
    if not business_unit or business_unit.lower() == 'nan':
        return 'N/A'
    
    business_unit = business_unit.upper().strip()
    
    # Mapeamento baseado nos valores aceitos no schema
    mapping = {
        'DIY': 'DIY',
        'TECH': 'TECH', 
        'KITCHEN_BEAUTY': 'KITCHEN_BEAUTY',
        'MOTOR_COMFORT': 'MOTOR_COMFORT',
        'N/A': 'N/A',
        'NA': 'N/A',
        '': 'N/A'
    }
    
    return mapping.get(business_unit, 'N/A')

def create_technical_parameters(row: pd.Series) -> Optional[str]:
    """Cria os parâmetros técnicos em formato JSON"""
    params = {}
    
    # Mapeia colunas que podem ser parâmetros técnicos
    technical_columns = [
        'voltagem', 'voltage', 'potencia', 'power', 'capacidade', 'capacity',
        'peso', 'weight', 'dimensoes', 'dimensions', 'material', 'cor', 'color',
        'garantia', 'warranty', 'origem', 'origin', 'classificacao_fiscal',
        'familia_grupos', 'familia_comercial', 'tipo_exclusividade'
    ]
    
    for col in technical_columns:
        if col in row.index and row[col] and str(row[col]).lower() != 'nan':
            params[col] = str(row[col])
    
    # Adiciona campos específicos se existirem
    for col in row.index:
        if col not in ['code', 'ean', 'description', 'category', 'business_unit'] and row[col] and str(row[col]).lower() != 'nan':
            params[col] = str(row[col])
    
    return json.dumps(params) if params else None

def prepare_product_data(row: pd.Series) -> Dict[str, Any]:
    """Prepara os dados do produto para inserção"""
    product_data = {
        'id': str(uuid.uuid4()),
        'code': str(row.get('code', '')).strip() if row.get('code') else None,
        'ean': str(row.get('ean', '')).strip() if row.get('ean') else None,
        'description': str(row.get('description', '')).strip() if row.get('description') else None,
        'category': str(row.get('category', '')).strip() if row.get('category') else None,
        'business_unit': map_business_unit(str(row.get('business_unit', ''))),
        'technical_parameters': create_technical_parameters(row),
        'created_at': datetime.now().isoformat()
    }
    
    # Remove campos None ou vazios
    product_data = {k: v for k, v in product_data.items() if v is not None and v != ''}
    
    return product_data

def insert_products_to_supabase(supabase: Client, products_data: list) -> None:
    """Insere os produtos no Supabase"""
    print(f"🚀 Inserindo {len(products_data)} produtos no Supabase...")
    
    success_count = 0
    error_count = 0
    
    for i, product in enumerate(products_data, 1):
        try:
            # Verificar se o produto já existe
            existing = supabase.table('products').select('id').eq('code', product['code']).execute()
            
            if existing.data:
                print(f"⏭️  Produto {product['code']} já existe, pulando...")
                continue
            
            # Inserir produto
            result = supabase.table('products').insert(product).execute()
            
            if result.data:
                print(f"✅ [{i}/{len(products_data)}] Produto inserido: {product['code']} - {product['description']}")
                success_count += 1
            else:
                print(f"❌ [{i}/{len(products_data)}] Erro ao inserir produto {product['code']}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ [{i}/{len(products_data)}] Erro ao inserir produto {product.get('code', 'N/A')}: {e}")
            error_count += 1
    
    print(f"\n📈 Resumo da importação:")
    print(f"✅ Produtos inseridos com sucesso: {success_count}")
    print(f"❌ Erros: {error_count}")
    print(f"📊 Total processado: {len(products_data)}")

def main():
    """Função principal"""
    print("🔄 Iniciando importação de produtos do Excel para o Supabase...")
    
    # Caminho do arquivo Excel
    excel_file = "DADOS.xlsx"
    
    if not os.path.exists(excel_file):
        print(f"❌ Arquivo não encontrado: {excel_file}")
        print("💡 Certifique-se de que o arquivo DADOS.xlsx está na pasta raiz do projeto")
        sys.exit(1)
    
    # Conectar ao Supabase
    supabase = connect_to_supabase()
    
    # Ler arquivo Excel
    df = read_excel_file(excel_file)
    
    # Limpar dados
    df = clean_data(df)
    
    # Preparar dados dos produtos
    print("🔧 Preparando dados dos produtos...")
    products_data = []
    
    for index, row in df.iterrows():
        try:
            product_data = prepare_product_data(row)
            
            # Validar dados obrigatórios
            if not product_data.get('code') or not product_data.get('description') or not product_data.get('category'):
                print(f"⚠️  Linha {index + 1}: Dados obrigatórios faltando, pulando...")
                continue
            
            products_data.append(product_data)
            
        except Exception as e:
            print(f"❌ Erro ao processar linha {index + 1}: {e}")
            continue
    
    print(f"✅ {len(products_data)} produtos preparados para inserção")
    
    # Inserir no Supabase
    if products_data:
        insert_products_to_supabase(supabase, products_data)
    else:
        print("❌ Nenhum produto válido encontrado para inserção")
    
    print("🎉 Importação concluída!")

if __name__ == "__main__":
    main()
