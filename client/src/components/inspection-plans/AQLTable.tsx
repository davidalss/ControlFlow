import React, { useState } from 'react';

interface AQLTableProps {
  lotSize: number;
}

const AQLTable: React.FC<AQLTableProps> = ({ lotSize }) => {
  const [inspectionLevel, setInspectionLevel] = useState<'I' | 'II' | 'III'>('II');

  const aqlLevels = {
    critical: 1.0,
    major: 2.5,
    minor: 4.0,
  };

  const calculateMaxAllowed = (percentage: number) => {
    return Math.floor((lotSize * percentage) / 100);
  };

  return (
    <section className="section nqa-section">
      <h2 className="section-title active">
        <span><i className="fas fa-chart-line"></i> Níveis de Qualidade Aceitável (NQA)</span>
        <span className="toggle-icon"><i className="fas fa-chevron-up"></i></span>
      </h2>
      <div className="section-content active">
        <div className="nqa-table-container">
          <div className="table-header">
            <h3>Tabela de Níveis NQA</h3>
            <div className="table-badge">
              <i className="fas fa-certificate"></i>
              <span>Padrão WAP</span>
            </div>
          </div>
          <div className="inspection-level-selection">
            <label htmlFor="inspection-level">Nível de Inspeção:</label>
            <select
              id="inspection-level"
              value={inspectionLevel}
              onChange={(e) => setInspectionLevel(e.target.value as 'I' | 'II' | 'III')}
            >
              <option value="I">Nível I</option>
              <option value="II">Nível II</option>
              <option value="III">Nível III</option>
            </select>
          </div>
          <div className="table-wrapper">
            <table className="nqa-table">
              <thead>
                <tr>
                  <th>Nível NQA</th>
                  <th>Descrição do Defeito</th>
                  <th>Limite Aceitável (%)</th>
                  <th>Quantidade Máxima Permitida</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="nqa-critical">
                    <div className="nqa-level">
                      <span className="level-indicator critical"></span>
                      <span className="level-text">NQA {aqlLevels.critical.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>Defeitos Críticos</td>
                  <td style={{ color: '#FF8800' }}>{aqlLevels.critical.toFixed(1)}%</td>
                  <td style={{ color: '#28A745' }}>{calculateMaxAllowed(aqlLevels.critical)}</td>
                </tr>
                <tr>
                  <td className="nqa-major">
                    <div className="nqa-level">
                      <span className="level-indicator major"></span>
                      <span className="level-text">NQA {aqlLevels.major.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>Defeitos Maiores</td>
                  <td style={{ color: '#FF8800' }}>{aqlLevels.major.toFixed(1)}%</td>
                  <td style={{ color: '#28A745' }}>{calculateMaxAllowed(aqlLevels.major)}</td>
                </tr>
                <tr>
                  <td className="nqa-minor">
                    <div className="nqa-level">
                      <span className="level-indicator minor"></span>
                      <span className="level-text">NQA {aqlLevels.minor.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>Defeitos Menores</td>
                  <td style={{ color: '#FF8800' }}>{aqlLevels.minor.toFixed(1)}%</td>
                  <td style={{ color: '#28A745' }}>{calculateMaxAllowed(aqlLevels.minor)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="nqa-legend">
          <h3><i className="fas fa-info-circle"></i> Classificação de Defeitos</h3>
          <div className="legend-grid">
            <div className="legend-card critical">
              <div className="card-header">
                <div className="card-icon critical">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div className="icon-glow critical"></div>
                </div>
                <h4>Defeitos Críticos</h4>
              </div>
              <div className="card-content">
                <p>Defeitos que podem comprometer a segurança do usuário, violar regulamentações ou tornar o produto inutilizável.</p>
              </div>
              <div className="card-footer">
                <div className="progress-bar">
                  <div className="progress critical" style={{ width: '10%' }}></div>
                </div>
                <span className="progress-text">10% tolerância</span>
              </div>
            </div>
            <div className="legend-card major">
              <div className="card-header">
                <div className="card-icon major">
                  <i className="fas fa-exclamation-circle"></i>
                  <div className="icon-glow major"></div>
                </div>
                <h4>Defeitos Maiores</h4>
              </div>
              <div className="card-content">
                <p>Defeitos que afetam significativamente a funcionalidade, desempenho ou aparência do produto, mas não o tornam inutilizável.</p>
              </div>
              <div className="card-footer">
                <div className="progress-bar">
                  <div className="progress major" style={{ width: '25%' }}></div>
                </div>
                <span className="progress-text">25% tolerância</span>
              </div>
            </div>
            <div className="legend-card minor">
              <div className="card-header">
                <div className="card-icon minor">
                  <i className="fas fa-exclamation"></i>
                  <div className="icon-glow minor"></div>
                </div>
                <h4>Defeitos Menores</h4>
              </div>
              <div className="card-content">
                <p>Defeitos que não afetam a funcionalidade ou desempenho do produto, apenas pequenas imperfeições na aparência.</p>
              </div>
              <div className="card-footer">
                <div className="progress-bar">
                  <div className="progress minor" style={{ width: '40%' }}></div>
                </div>
                <span className="progress-text">40% tolerância</span>
              </div>
            </div>
          </div>
        </div>

        <div className="nqa-explanation">
          <div className="explanation-header">
            <div className="header-icon">
              <div className="icon-container">
                <i className="fas fa-book-open"></i>
                <div className="icon-pulse"></div>
              </div>
            </div>
            <h3>Como Funciona o NQA</h3>
          </div>
          <div className="explanation-content">
            <p>O NQA (Nível de Qualidade Aceitável) define o limite máximo de defeitos aceitáveis em uma <i><b>amostra</b></i> de produtos. Este <i><b>limite</b></i> é baseado na quantidade total da NF (Nota Fiscal) e determina se um <i><b>lote</b></i> deve ser aceito ou rejeitado.</p>
            <p>Durante a inspeção, uma <i><b>amostra</b></i> representativa é selecionada e avaliada conforme os critérios estabelecidos. Se o número de defeitos encontrados na <i><b>amostra</b></i> estiver dentro do <i><b>limite</b></i> NQA, o <i><b>lote</b></i> é <i><b>aceito</b></i>; caso contrário, é rejeitado.</p>
          </div>
          <div className="process-visualization">
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="step-label">Amostragem</div>
            </div>
            <div className="process-connection"></div>
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="step-label">Inspeção</div>
            </div>
            <div className="process-connection"></div>
            <div className="process-step">
              <div className="step-icon">
                <i className="fas fa-balance-scale"></i>
              </div>
              <div className="step-label">Decisão</div>
            </div>
          </div>
        </div>

        <div className="nqa-example">
          <div className="example-header">
            <div className="header-icon">
              <div className="icon-container">
                <i className="fas fa-calculator"></i>
                <div className="icon-pulse"></div>
              </div>
            </div>
            <h3>Exemplo Prático de Cálculo</h3>
          </div>
          <div className="example-intro">
            <p>Considerando uma Nota Fiscal (NF) com {lotSize} unidades. Nível de Inspeção: {inspectionLevel}. Calcular e exibir na coluna "Quantidade Máxima Permitida" os valores reais permitidos para cada tipo de defeito.</p>
          </div>
          <div className="calculation-grid">
            <div className="calc-card critical">
              <div className="calc-header">
                <div className="calc-icon critical">
                  <i className="fas fa-percentage"></i>
                  <div className="icon-glow critical"></div>
                </div>
                <h4>NQA {aqlLevels.critical.toFixed(1)}% (Críticos)</h4>
              </div>
              <div className="calc-body">
                <div className="calc-formula">
                  <div className="calc-step">
                    <span className="calc-label">Fórmula:</span>
                    <span className="calc-equation">{lotSize} × {aqlLevels.critical.toFixed(1)}%</span>
                  </div>
                  <div className="calc-result">
                    <span className="result">{calculateMaxAllowed(aqlLevels.critical)} defeitos</span>
                  </div>
                </div>
                <div className="calc-description">
                  Máximo de {calculateMaxAllowed(aqlLevels.critical)} defeitos críticos permitidos para aceitar o lote.
                </div>
              </div>
            </div>
            <div className="calc-card major">
              <div className="calc-header">
                <div className="calc-icon major">
                  <i className="fas fa-percentage"></i>
                  <div className="icon-glow major"></div>
                </div>
                <h4>NQA {aqlLevels.major.toFixed(1)}% (Maiores)</h4>
              </div>
              <div className="calc-body">
                <div className="calc-formula">
                  <div className="calc-step">
                    <span className="calc-label">Fórmula:</span>
                    <span className="calc-equation">{lotSize} × {aqlLevels.major.toFixed(1)}%</span>
                  </div>
                  <div className="calc-result">
                    <span className="result">{calculateMaxAllowed(aqlLevels.major)} defeitos</span>
                  </div>
                </div>
                <div className="calc-description">
                  Máximo de {calculateMaxAllowed(aqlLevels.major)} defeitos maiores permitidos para aceitar o lote.
                </div>
              </div>
            </div>
            <div className="calc-card minor">
              <div className="calc-header">
                <div className="calc-icon minor">
                  <i className="fas fa-percentage"></i>
                  <div className="icon-glow minor"></div>
                </div>
                <h4>NQA {aqlLevels.minor.toFixed(1)}% (Menores)</h4>
              </div>
              <div className="calc-body">
                <div className="calc-formula">
                  <div className="calc-step">
                    <span className="calc-label">Fórmula:</span>
                    <span className="calc-equation">{lotSize} × {aqlLevels.minor.toFixed(1)}%</span>
                  </div>
                  <div className="calc-result">
                    <span className="result">{calculateMaxAllowed(aqlLevels.minor)} defeitos</span>
                  </div>
                </div>
                <div className="calc-description">
                  Máximo de {calculateMaxAllowed(aqlLevels.minor)} defeitos menores permitidos para aceitar o lote.
                </div>
              </div>
            </div>
          </div>
          <div className="example-conclusion">
            <div className="conclusion-icon">
              <div className="icon-container">
                <i className="fas fa-lightbulb"></i>
                <div className="icon-pulse"></div>
              </div>
            </div>
            <div className="conclusion-text">
              <h4>Conclusão</h4>
              <div className="conclusion-content">
                <p>Se o número de defeitos encontrados na amostra for igual ou inferior a esses valores, o lote é aceito. Caso contrário, o lote é rejeitado e deve passar por análise adicional.</p>
                <div className="conclusion-metric">
                  <div className="metric-item">
                    <div className="metric-value critical">≤ {calculateMaxAllowed(aqlLevels.critical)}</div>
                    <div className="metric-label">Críticos</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value major">≤ {calculateMaxAllowed(aqlLevels.major)}</div>
                    <div className="metric-label">Maiores</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value minor">≤ {calculateMaxAllowed(aqlLevels.minor)}</div>
                    <div className="metric-label">Menores</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AQLTable;