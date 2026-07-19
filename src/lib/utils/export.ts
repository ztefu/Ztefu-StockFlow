import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export function exportToCSV(filename: string, data: any[]) {
  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Export CSV réussi !");
  } catch (error) {
    console.error("Erreur lors de l'export CSV:", error);
    toast.error("Erreur lors de l'export CSV.");
  }
}

export function exportToPDF(filename: string, title: string, headers: string[], data: any[][]) {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    doc.save(filename);
    toast.success("Export PDF réussi !");
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    toast.error("Erreur lors de l'export PDF.");
  }
}
