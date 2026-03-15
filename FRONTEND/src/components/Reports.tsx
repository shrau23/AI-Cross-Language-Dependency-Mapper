import { FileText, Download, AlertCircle, CheckCircle, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import { ImpactResponse, GraphResponse, GraphEdge, AffectedNode } from '../types';
import { dashboardMetrics } from '../data/sampleData';

interface ReportsProps {
  impactData: ImpactResponse | null;
  graphData: GraphResponse | null;
}

const Reports = ({ impactData, graphData }: ReportsProps) => {
  const generatePDF = () => {
    let yPos = 140;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Cross-Language Dependency Report', 20, 20);

    // Narrative Summary
    doc.setFontSize(14);
    doc.text('Narrative Summary', 20, 40);
    doc.setFontSize(12);
    const summary = `Generated on ${new Date().toLocaleString()}. 
Total files analyzed: ${dashboardMetrics.totalFiles || 0}. 
Languages: ${dashboardMetrics.languagesDetected || 0}. 
Total dependencies: ${dashboardMetrics.totalDependencies || 0}. 
Overall risk level: ${dashboardMetrics.riskLevel || 'Unknown'}.`;
    doc.text(summary, 20, 55, { maxWidth: 170 });

    // Risk Scores
    if (impactData) {
      doc.setFontSize(14);
      doc.text('Risk Analysis', 20, 90);
      doc.setFontSize(12);
      doc.text(`Blast Radius Score: ${impactData.summary.blast_radius_score}`, 20, 105);
      doc.text(`Affected Nodes: ${impactData.summary.affected_count}`, 20, 115);
      doc.text(`High-Risk Nodes: ${impactData.summary.high_risk_count}`, 20, 125);

      // Affected Nodes Table
      let yPos = 140;
      doc.text('Affected Nodes:', 20, yPos);
      yPos += 10;
      impactData.affected_nodes.slice(0, 10).forEach((node: AffectedNode, idx: number) => {
        doc.text(`${node.id} (Risk: ${Math.round(node.risk_score * 100)}%, Depth: ${node.depth})`, 20, yPos);
        yPos += 8;
      });
    }

    // Cross-language Edges (dynamic)
    if (graphData && graphData.edges) {
      const crossLangEdges = graphData.edges
        .filter((edge: GraphEdge) => edge.sourceLanguage !== edge.targetLanguage)
        .map((edge: GraphEdge) => `${edge.source} (${edge.sourceLanguage}) -> ${edge.target} (${edge.targetLanguage})`);

      doc.setFontSize(14);
      doc.text('Cross-Language Edges', 20, yPos + 10);
      doc.setFontSize(12);
      crossLangEdges.forEach((edge, idx) => {
        doc.text(edge, 20, yPos + 25 + (idx * 8));
      });
    }

    doc.save('dependency-report.pdf');
  };

  const riskLevel = impactData && impactData.summary ? 
                    (impactData.summary.blast_radius_score >= 70 ? 'High' : 
                     impactData.summary.blast_radius_score >= 35 ? 'Medium' : 'Low') : 'Low';

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-500" />
          <span>Reports Dashboard</span>
        </h3>
        
        {/* Narrative */}
        <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
          <h4 className="text-gray-300 font-medium mb-2">📊 Executive Summary</h4>
          <p className="text-gray-400 leading-relaxed">
            This report covers cross-language dependencies across {dashboardMetrics.totalFiles || 0} files in{' '}
            {dashboardMetrics.languagesDetected || 0} languages with {dashboardMetrics.totalDependencies || 0} total edges. 
            Risk level: <span className={`font-bold px-2 py-1 rounded-full text-sm ${
              riskLevel === 'High' ? 'bg-red-500/20 text-red-300' :
              riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              {riskLevel}
            </span>
          </p>
        </div>

        {/* Cross-Language Edges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 className="text-gray-300 font-medium mb-3 flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4" /> Cross-Language Edges
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {graphData && graphData.edges ? graphData.edges
                .filter((edge: GraphEdge) => edge.sourceLanguage !== edge.targetLanguage)
                .map((edge: GraphEdge, idx: number) => (
                  <div key={idx} className="text-sm text-cyan-300 bg-gray-800 px-3 py-2 rounded-lg">
                    {edge.source} → {edge.target} ({edge.sourceLanguage}→{edge.targetLanguage})
                  </div>
                )) : (
                  <div className="text-gray-500">No cross-language edges found.</div>
                )}
            </div>
          </div>

          {/* Risk Scores */}
          {impactData && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h4 className="text-gray-300 font-medium mb-3 flex items-center space-x-2">
                ⚠️ Risk Scores
              </h4>
              <div className={`p-4 rounded-lg mb-4 ${
                riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20' :
                riskLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-green-500/10 border-green-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Blast Radius</span>
                  <span className="font-bold text-2xl">{impactData.summary.blast_radius_score}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Affected: {impactData.summary.affected_count}</div>
                  <div>High Risk: {impactData.summary.high_risk_count}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Export Button */}
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={generatePDF}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>📄 Export Full Report as PDF</span>
          </button>
        </div>
      </div>

      {!impactData && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>Run an impact simulation to generate detailed reports</p>
        </div>
      )}
    </div>
  );
};

export default Reports;