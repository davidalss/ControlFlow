#!/usr/bin/env python3
"""
Script para converter PDF em imagem
Usado para extrair a primeira página de PDFs de referência de etiquetas
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import tempfile
import shutil

try:
    from pdf2image import convert_from_path, convert_from_bytes
    from PIL import Image
except ImportError as e:
    print(f"Erro: Dependência não instalada: {e}")
    print("Execute: pip install pdf2image Pillow")
    sys.exit(1)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PDFToImageConverter:
    """Classe para converter PDF em imagem"""
    
    def __init__(self, output_dir: str = "temp_images"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Configurações para conversão
        self.dpi = 300  # DPI para conversão
        self.format = 'PNG'  # Formato de saída
        self.first_page_only = True  # Converter apenas primeira página
    
    def convert_pdf_file(self, pdf_path: str, output_filename: Optional[str] = None) -> Dict[str, Any]:
        """Converte um arquivo PDF em imagem"""
        try:
            pdf_path = Path(pdf_path)
            
            if not pdf_path.exists():
                raise FileNotFoundError(f"Arquivo PDF não encontrado: {pdf_path}")
            
            logger.info(f"Convertendo PDF: {pdf_path}")
            
            # Converter PDF para imagem
            if self.first_page_only:
                images = convert_from_path(
                    pdf_path, 
                    dpi=self.dpi, 
                    first_page=1, 
                    last_page=1
                )
            else:
                images = convert_from_path(pdf_path, dpi=self.dpi)
            
            if not images:
                raise ValueError("Nenhuma imagem foi gerada do PDF")
            
            # Salvar primeira imagem
            image = images[0]
            
            # Definir nome do arquivo de saída
            if output_filename is None:
                output_filename = f"{pdf_path.stem}_page1.{self.format.lower()}"
            
            output_path = self.output_dir / output_filename
            
            # Salvar imagem
            image.save(output_path, self.format)
            
            logger.info(f"Imagem salva: {output_path}")
            
            return {
                'success': True,
                'input_pdf': str(pdf_path),
                'output_image': str(output_path),
                'image_size': image.size,
                'dpi': self.dpi,
                'format': self.format,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Erro ao converter PDF {pdf_path}: {str(e)}")
            return {
                'success': False,
                'input_pdf': str(pdf_path),
                'output_image': None,
                'image_size': None,
                'dpi': self.dpi,
                'format': self.format,
                'error': str(e)
            }
    
    def convert_pdf_bytes(self, pdf_bytes: bytes, filename: str, output_filename: Optional[str] = None) -> Dict[str, Any]:
        """Converte bytes de PDF em imagem"""
        try:
            logger.info(f"Convertendo PDF de bytes: {filename}")
            
            # Converter PDF para imagem
            if self.first_page_only:
                images = convert_from_bytes(
                    pdf_bytes, 
                    dpi=self.dpi, 
                    first_page=1, 
                    last_page=1
                )
            else:
                images = convert_from_bytes(pdf_bytes, dpi=self.dpi)
            
            if not images:
                raise ValueError("Nenhuma imagem foi gerada do PDF")
            
            # Salvar primeira imagem
            image = images[0]
            
            # Definir nome do arquivo de saída
            if output_filename is None:
                base_name = Path(filename).stem
                output_filename = f"{base_name}_page1.{self.format.lower()}"
            
            output_path = self.output_dir / output_filename
            
            # Salvar imagem
            image.save(output_path, self.format)
            
            logger.info(f"Imagem salva: {output_path}")
            
            return {
                'success': True,
                'input_filename': filename,
                'output_image': str(output_path),
                'image_size': image.size,
                'dpi': self.dpi,
                'format': self.format,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Erro ao converter PDF de bytes {filename}: {str(e)}")
            return {
                'success': False,
                'input_filename': filename,
                'output_image': None,
                'image_size': None,
                'dpi': self.dpi,
                'format': self.format,
                'error': str(e)
            }
    
    def convert_with_upload(self, pdf_path: str, upload_dir: str) -> Dict[str, Any]:
        """Converte PDF e move para diretório de upload"""
        try:
            # Converter PDF
            result = self.convert_pdf_file(pdf_path)
            
            if not result['success']:
                return result
            
            # Mover para diretório de upload
            upload_path = Path(upload_dir)
            upload_path.mkdir(exist_ok=True)
            
            source_path = Path(result['output_image'])
            dest_path = upload_path / source_path.name
            
            shutil.move(str(source_path), str(dest_path))
            
            result['upload_path'] = str(dest_path)
            logger.info(f"Arquivo movido para upload: {dest_path}")
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao mover arquivo para upload: {str(e)}")
            result['error'] = str(e)
            result['success'] = False
            return result
    
    def cleanup_temp_files(self):
        """Remove arquivos temporários"""
        try:
            if self.output_dir.exists():
                shutil.rmtree(self.output_dir)
                logger.info(f"Diretório temporário removido: {self.output_dir}")
        except Exception as e:
            logger.error(f"Erro ao limpar arquivos temporários: {str(e)}")

def main():
    """Função principal para execução via linha de comando"""
    parser = argparse.ArgumentParser(description='Conversor de PDF para imagem')
    parser.add_argument('pdf_file', help='Caminho para o arquivo PDF')
    parser.add_argument('--output', '-o', help='Nome do arquivo de saída')
    parser.add_argument('--dpi', type=int, default=300, help='DPI para conversão (padrão: 300)')
    parser.add_argument('--format', choices=['PNG', 'JPEG', 'TIFF'], default='PNG', help='Formato de saída')
    parser.add_argument('--upload-dir', help='Diretório para mover arquivo convertido')
    parser.add_argument('--cleanup', action='store_true', help='Limpar arquivos temporários após conversão')
    parser.add_argument('--all-pages', action='store_true', help='Converter todas as páginas (padrão: apenas primeira)')
    
    args = parser.parse_args()
    
    # Verificar se o arquivo existe
    if not os.path.exists(args.pdf_file):
        print(f"Erro: Arquivo PDF não encontrado: {args.pdf_file}")
        sys.exit(1)
    
    # Configurar conversor
    converter = PDFToImageConverter()
    converter.dpi = args.dpi
    converter.format = args.format
    converter.first_page_only = not args.all_pages
    
    # Executar conversão
    if args.upload_dir:
        result = converter.convert_with_upload(args.pdf_file, args.upload_dir)
    else:
        result = converter.convert_pdf_file(args.pdf_file, args.output)
    
    # Exibir resultado
    print(json.dumps(result, indent=2))
    
    # Limpar arquivos temporários se solicitado
    if args.cleanup:
        converter.cleanup_temp_files()
    
    # Retornar código de saída baseado no sucesso
    sys.exit(0 if result['success'] else 1)

if __name__ == '__main__':
    main()
