#!/usr/bin/env python3
"""
Script para comparação de imagens usando OpenCV e SSIM
Usado para inspeção de etiquetas no sistema de qualidade
"""

import cv2
import numpy as np
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, Tuple
import logging
from skimage.metrics import structural_similarity as ssim
from skimage import io
import argparse

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageComparator:
    """Classe para comparação de imagens usando múltiplos métodos"""
    
    def __init__(self):
        self.methods = {
            'ssim': self._compare_ssim,
            'orb': self._compare_orb,
            'template': self._compare_template
        }
    
    def load_image(self, image_path: str) -> np.ndarray:
        """Carrega e pré-processa uma imagem"""
        try:
            # Carregar imagem
            if image_path.startswith('http'):
                # Para URLs, usar skimage
                image = io.imread(image_path)
                if len(image.shape) == 3:
                    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            else:
                # Para arquivos locais, usar OpenCV
                image = cv2.imread(image_path)
            
            if image is None:
                raise ValueError(f"Não foi possível carregar a imagem: {image_path}")
            
            # Converter para escala de cinza
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Redimensionar para tamanho padrão (opcional)
            # gray = cv2.resize(gray, (800, 600))
            
            return gray
            
        except Exception as e:
            logger.error(f"Erro ao carregar imagem {image_path}: {str(e)}")
            raise
    
    def _compare_ssim(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Compara imagens usando Structural Similarity Index (SSIM)"""
        try:
            # Garantir que as imagens tenham o mesmo tamanho
            if img1.shape != img2.shape:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
            
            # Calcular SSIM
            score = ssim(img1, img2)
            return max(0.0, min(1.0, score))  # Garantir que está entre 0 e 1
            
        except Exception as e:
            logger.error(f"Erro no cálculo SSIM: {str(e)}")
            return 0.0
    
    def _compare_orb(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Compara imagens usando ORB Feature Matching"""
        try:
            # Inicializar detector ORB
            orb = cv2.ORB_create(nfeatures=1000)
            
            # Detectar keypoints e descritores
            kp1, des1 = orb.detectAndCompute(img1, None)
            kp2, des2 = orb.detectAndCompute(img2, None)
            
            if des1 is None or des2 is None:
                return 0.0
            
            # Criar matcher
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            
            # Ordenar matches por distância
            matches = sorted(matches, key=lambda x: x.distance)
            
            # Calcular score baseado no número de matches bons
            good_matches = [m for m in matches if m.distance < 50]  # Threshold
            score = len(good_matches) / max(len(kp1), len(kp2), 1)
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"Erro no cálculo ORB: {str(e)}")
            return 0.0
    
    def _compare_template(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Compara imagens usando Template Matching"""
        try:
            # Garantir que as imagens tenham o mesmo tamanho
            if img1.shape != img2.shape:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
            
            # Aplicar template matching
            result = cv2.matchTemplate(img1, img2, cv2.TM_CCOEFF_NORMED)
            score = np.max(result)
            
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            logger.error(f"Erro no cálculo Template Matching: {str(e)}")
            return 0.0
    
    def compare_images(self, reference_path: str, test_path: str, method: str = 'ssim') -> Dict[str, Any]:
        """Compara duas imagens e retorna o resultado"""
        try:
            logger.info(f"Iniciando comparação de imagens usando método: {method}")
            
            # Carregar imagens
            reference_img = self.load_image(reference_path)
            test_img = self.load_image(test_path)
            
            # Verificar se o método existe
            if method not in self.methods:
                raise ValueError(f"Método de comparação '{method}' não suportado")
            
            # Executar comparação
            score = self.methods[method](reference_img, test_img)
            
            # Preparar resultado
            result = {
                'method': method,
                'score': round(score, 4),
                'score_percentage': round(score * 100, 2),
                'reference_image': reference_path,
                'test_image': test_path,
                'success': True,
                'error': None
            }
            
            logger.info(f"Comparação concluída. Score: {score:.4f} ({score*100:.2f}%)")
            return result
            
        except Exception as e:
            logger.error(f"Erro na comparação de imagens: {str(e)}")
            return {
                'method': method,
                'score': 0.0,
                'score_percentage': 0.0,
                'reference_image': reference_path,
                'test_image': test_path,
                'success': False,
                'error': str(e)
            }
    
    def compare_multiple_methods(self, reference_path: str, test_path: str) -> Dict[str, Any]:
        """Compara imagens usando múltiplos métodos e retorna o melhor resultado"""
        results = {}
        
        for method in self.methods.keys():
            result = self.compare_images(reference_path, test_path, method)
            results[method] = result
        
        # Encontrar o melhor score
        best_method = max(results.keys(), key=lambda m: results[m]['score'])
        best_result = results[best_method]
        
        return {
            'best_method': best_method,
            'best_score': best_result['score'],
            'best_score_percentage': best_result['score_percentage'],
            'all_results': results,
            'success': best_result['success'],
            'error': best_result.get('error')
        }

def main():
    """Função principal para execução via linha de comando"""
    parser = argparse.ArgumentParser(description='Comparador de imagens para inspeção de etiquetas')
    parser.add_argument('reference', help='Caminho para a imagem de referência')
    parser.add_argument('test', help='Caminho para a imagem de teste')
    parser.add_argument('--method', choices=['ssim', 'orb', 'template', 'all'], 
                       default='ssim', help='Método de comparação')
    parser.add_argument('--output', help='Arquivo de saída JSON (opcional)')
    
    args = parser.parse_args()
    
    # Verificar se os arquivos existem
    if not os.path.exists(args.reference):
        print(f"Erro: Arquivo de referência não encontrado: {args.reference}")
        sys.exit(1)
    
    if not os.path.exists(args.test):
        print(f"Erro: Arquivo de teste não encontrado: {args.test}")
        sys.exit(1)
    
    # Executar comparação
    comparator = ImageComparator()
    
    if args.method == 'all':
        result = comparator.compare_multiple_methods(args.reference, args.test)
    else:
        result = comparator.compare_images(args.reference, args.test, args.method)
    
    # Exibir resultado
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Resultado salvo em: {args.output}")
    else:
        print(json.dumps(result, indent=2))
    
    # Retornar código de saída baseado no sucesso
    sys.exit(0 if result['success'] else 1)

if __name__ == '__main__':
    main()
