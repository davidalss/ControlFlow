import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const InspectionPlanHeader = ({ plan, onSave, isEditing, setIsEditing }) => {
  const [headerData, setHeaderData] = useState(plan || {
    documentNumber: '',
    revision: '',
    date: new Date().toLocaleDateString('pt-BR'),
    page: '1 de 1',
    preparedBy: '',
    reviewedBy: '',
    approvedBy: '',
  });

  const handleInputChange = (field, value) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(headerData);
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <div className="inspection-header">
        <div className="header-main">
          <h1>Plano de Inspeção</h1>
        </div>
        <div className="header-grid">
          <div className="info-section">
            <div className="info-item">
              <i className="fas fa-file-alt"></i>
              <span className="info-label">Documento Nº:</span>
              {isEditing ? (
                <Input
                  value={headerData.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  className="info-value-input"
                />
              ) : (
                <span className="info-value-display">{headerData.documentNumber}</span>
              )}
            </div>
            <div className="info-item">
              <i className="fas fa-code-branch"></i>
              <span className="info-label">Revisão:</span>
              {isEditing ? (
                <Input
                  value={headerData.revision}
                  onChange={(e) => handleInputChange('revision', e.target.value)}
                  className="info-value-input"
                />
              ) : (
                <span className="info-value-display">{headerData.revision}</span>
              )}
            </div>
            <div className="info-item">
              <i className="fas fa-calendar-alt"></i>
              <span className="info-label">Data:</span>
              <span className="info-value-display">{headerData.date}</span>
            </div>
            <div className="info-item">
              <i className="fas fa-file-invoice"></i>
              <span className="info-label">Página:</span>
              <span className="info-value-display">{headerData.page}</span>
            </div>
          </div>
          <div className="responsible-section">
            <div className="responsible-item">
              <i className="fas fa-pencil-alt"></i>
              <span className="info-label">Elaborado por:</span>
              {isEditing ? (
                <Input
                  value={headerData.preparedBy}
                  onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                  className="info-value-input"
                />
              ) : (
                <span className="info-value-display">{headerData.preparedBy}</span>
              )}
            </div>
            <div className="responsible-item">
              <i className="fas fa-search"></i>
              <span className="info-label">Revisado por:</span>
              {isEditing ? (
                <Input
                  value={headerData.reviewedBy}
                  onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
                  className="info-value-input"
                />
              ) : (
                <span className="info-value-display">{headerData.reviewedBy}</span>
              )}
            </div>
            <div className="responsible-item">
              <i className="fas fa-check-circle"></i>
              <span className="info-label">Aprovado por:</span>
              {isEditing ? (
                <Input
                  value={headerData.approvedBy}
                  onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                  className="info-value-input"
                />
              ) : (
                <span className="info-value-display">{headerData.approvedBy}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          {isEditing ? (
            <Button onClick={handleSave}>Salvar</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          )}
        </div>
      </div>
      <style jsx>{`
        .inspection-header {
            background: linear-gradient(135deg, #0a4d8c, #0a3d6c);
            color: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .inspection-header:before {
            content: '';
            position: absolute;
            top: -50px;
            left: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            opacity: 0.5;
            transform: rotate(45deg);
        }
        
        .inspection-header:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .header-main {
            text-align: center;
            margin-bottom: 25px;
        }

        .header-main h1 {
            font-size: 2.5em;
            font-weight: 700;
            margin: 0;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
        }

        .header-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            align-items: center;
        }

        .info-section, .responsible-section {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: background 0.3s ease;
        }
        
        .info-section:hover, .responsible-section:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .info-item, .responsible-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 1em;
        }
        
        .info-item:last-child, .responsible-item:last-child {
            margin-bottom: 0;
        }

        .info-item i, .responsible-item i {
            font-size: 1.2em;
            margin-right: 12px;
            width: 20px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .info-item:hover i, .responsible-item:hover i {
            transform: scale(1.2);
        }

        .info-label {
            font-weight: 500;
            margin-right: 8px;
            color: #f0f4f8; /* Light gray for labels */
        }

        .info-value-display {
            font-weight: 400;
            color: white; /* White for displayed values */
        }

        .info-value-input {
            color: #333; /* Dark text for input fields */
            background-color: white;
            border: 1px solid #ccc;
            padding: 4px 8px;
            border-radius: 4px;
            width: 100%;
        }
      `}</style>
    </Card>
  );
};

export default InspectionPlanHeader;