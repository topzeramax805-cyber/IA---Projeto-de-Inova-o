
import type { AnalysisResult } from '../types';

declare const jspdf: any;
const { jsPDF } = jspdf;

// Helper to convert image to base64 data URL
const toBase64 = (url: string): Promise<string> =>
    fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

export const generatePdf = async (result: AnalysisResult, imageUrl: string) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RELATÓRIO DE ANÁLISE DE FITÓLITO', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`ID da Amostra: ${result.sample_site_details.id_sample} | Data: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;

  // Image
  try {
    const imageBase64 = await toBase64(imageUrl);
    const imgProps = doc.getImageProperties(imageBase64);
    const imgWidth = pageWidth * 0.6;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    const x = (pageWidth - imgWidth) / 2;
    doc.addImage(imageBase64, 'PNG', x, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  } catch (error) {
    console.error("Error loading image for PDF:", error);
    doc.text("Erro ao carregar a imagem.", 15, y);
    y += 10;
  }
  
  if (y > pageHeight - 40) { doc.addPage(); y = 20; }

  // Sections
  const addSection = (title: string, content: () => void) => {
    if (y > pageHeight - 40) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    content();
    y += 10;
  };

  addSection('Identificação Taxonômica', () => {
    (doc as any).autoTable({
      startY: y,
      head: [['Morfotipo', 'Família', 'Subfamília', 'Tipo Célula']],
      body: [[result.morphotype, result.family, result.subfamily, result.cell_type]],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });
    y = (doc as any).lastAutoTable.finalY;
  });

  addSection('Descrição Morfológica', () => {
    const desc = result.morphological_description;
    const text = [
        `Forma: ${desc.shape}`,
        `Dimensões: ${desc.dimensions}`,
        `Ornamentação: ${desc.surface_ornamentation}`,
        `Diagnóstico: ${desc.diagnostic_features}`,
        `Preservação: ${desc.preservation_state}`
    ];
    doc.text(text, 15, y);
    y += text.length * 5;
  });
  
  addSection('Datação e Período Histórico', () => {
    doc.setFillColor(248, 249, 250); // #F8F9FA
    doc.rect(15, y - 4, pageWidth - 30, 20, 'F');
    doc.text(`Período: ${result.historical_period.geological_cultural_period}`, 20, y);
    doc.text(`Intervalo Estimado: ${result.historical_period.estimated_age_range}`, 20, y + 5);
    doc.text(`Base da Datação: ${result.historical_period.dating_basis}`, 20, y + 10);
    y+= 18;
  });

  addSection('Contexto Arqueológico Completo', () => {
    const interp = result.archaeological_context_interpretation;
    const text = [
        `Uso da Planta: ${interp.plant_use}`,
        `Significância Cultural: ${interp.cultural_significance}`,
        `Impacto do Fogo: ${interp.fire_impact_analysis}`,
        `Associação com Artefatos: ${interp.association_with_artifacts}`,
        `Estratégia de Subsistência: ${interp.subsistence_strategy}`,
        `Reconstrução Ambiental: ${interp.environmental_reconstruction}`
    ];
    doc.text(text, 15, y);
    y += text.length * 5;
  });
  
  addSection('Níveis de Confiança', () => {
    (doc as any).autoTable({
        startY: y,
        head: [['Critério', 'Confiança (%)']],
        body: Object.entries(result.confidence_analysis).map(([key, value]) => [
            key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '), value
        ]),
        theme: 'striped'
    });
    y = (doc as any).lastAutoTable.finalY;
  });

  addSection('Observações e Recomendações', () => {
    doc.setFont('helvetica', 'bold');
    doc.text('Observações Adicionais:', 15, y);
    y+= 5;
    doc.setFont('helvetica', 'normal');
    const obsText = doc.splitTextToSize(result.additional_observations, pageWidth - 30);
    doc.text(obsText, 15, y);
    y+= obsText.length * 5 + 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Recomendações:', 15, y);
    y+= 5;
    doc.setFont('helvetica', 'normal');
    const recText = doc.splitTextToSize(result.recommendations, pageWidth - 30);
    doc.text(recText, 15, y);
    y += recText.length * 5;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text('Análise automatizada por IA - Requer validação por especialista em fitólitos.', 15, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 25, pageHeight - 10);
  }


  doc.save(`phytolith-report-${result.sample_site_details.id_sample}.pdf`);
};
