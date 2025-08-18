#!/usr/bin/env python3
"""
Script para instalar dependências Python necessárias para importação de produtos
"""

import subprocess
import sys
import os

def install_requirements():
    """Instala as dependências do requirements.txt"""
    try:
        print("📦 Instalando dependências Python...")
        
        # Caminho para o requirements.txt
        requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
        
        # Instalar dependências
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ])
        
        print("✅ Dependências instaladas com sucesso!")
        print("\n📋 Dependências instaladas:")
        print("- pandas: Para leitura de arquivos Excel")
        print("- openpyxl: Para suporte a arquivos .xlsx")
        print("- supabase: Para conexão com o Supabase")
        print("- python-dotenv: Para variáveis de ambiente")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    install_requirements()
