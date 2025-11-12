'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Parser } from 'json2csv';

interface ExportAnalyticsDataProps {
  summary: any;
  estates: any[];
  agents: any[];
  trends: any;
}

export default function ExportAnalyticsData({ summary, estates, agents, trends }: ExportAnalyticsDataProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    try {
      setExporting(true);

      // Create CSV data for estates
      const estateFields = ['estate_name', 'total_revenue', 'total_customers', 'growth_rate_30d', 'conversion_rate'];
      const estateParser = new Parser({ fields: estateFields });
      const estateCSV = estateParser.parse(estates);

      // Create CSV data for agents
      const agentFields = ['agent_name', 'total_commissions', 'performance_score', 'payments_collected'];
      const agentParser = new Parser({ fields: agentFields });
      const agentCSV = agentParser.parse(agents);

      // Combine into one CSV with sections
      const combinedCSV = `Analytics Report - ${new Date().toLocaleDateString()}\n\n` +
        `SUMMARY\nTotal Revenue,${summary?.total_revenue || 0}\n` +
        `Active Customers,${summary?.active_customers || 0}\n` +
        `Growth Rate (30d),${summary?.growth_rate_30d || 0}%\n` +
        `Conversion Rate,${summary?.conversion_rate || 0}%\n\n` +
        `ESTATES\n${estateCSV}\n\n` +
        `AGENTS\n${agentCSV}`;

      // Download CSV
      const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setExporting(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header with company logo placeholder
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Blue color
      doc.text('Pinnacle Builders', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Analytics Report', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 37, { align: 'center' });

      // Summary Section
      let yPosition = 50;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Executive Summary', 14, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      const summaryData = [
        ['Total Revenue', `₦${summary?.total_revenue.toLocaleString() || '0'}`],
        ['Active Customers', summary?.active_customers.toLocaleString() || '0'],
        ['Total Agents', summary?.total_agents.toLocaleString() || '0'],
        ['Growth Rate (30d)', `${summary?.growth_rate_30d?.toFixed(1) || '0'}%`],
        ['Conversion Rate', `${summary?.conversion_rate?.toFixed(1) || '0'}%`],
        ['Avg Payment Amount', `₦${summary?.avg_payment_amount?.toLocaleString() || '0'}`],
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
      });

      // Estates Section
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Top Estates Performance', 14, yPosition);
      
      yPosition += 5;
      const estateData = estates.slice(0, 10).map(e => [
        e.estate_name,
        `₦${e.total_revenue.toLocaleString()}`,
        e.total_customers,
        `${e.growth_rate_30d.toFixed(1)}%`,
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Estate', 'Revenue', 'Customers', 'Growth']],
        body: estateData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
      });

      // Agents Section (new page)
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(14);
      doc.text('Top Agents Performance', 14, yPosition);
      
      yPosition += 5;
      const agentData = agents.slice(0, 10).map((a, index) => [
        index + 1,
        a.agent_name,
        a.performance_score,
        `₦${a.total_commissions.toLocaleString()}`,
        a.payments_collected,
      ]);

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Rank', 'Agent', 'Score', 'Commissions', 'Payments']],
        body: agentData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} | Confidential - Pinnacle Builders`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToCSV}
        disabled={exporting}
        variant="outline"
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export CSV
      </Button>
      <Button
        onClick={exportToPDF}
        disabled={exporting}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </Button>
    </div>
  );
}
