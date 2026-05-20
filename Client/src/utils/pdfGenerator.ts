import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface PdfData<T> {
  title: string;
  data: T[];
  filename?: string;
  columns?: { header: string; dataKey: keyof T }[];
}

export const generatePDF = <
  T extends { [key: string]: string | number | boolean | null | undefined }
>({
  title,
  data,
  filename = "download.pdf",
  columns,
}: PdfData<T>) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header bar
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setDrawColor(200, 200, 200);
  doc.line(0, 45, pageWidth, 45);

  // Company name
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text("Event Pro", pageWidth / 2, 35, { align: "center" });

  // Contact info in header
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("www.eventpro.com", 14, 15);
  doc.text("contact@eventpro.com", 14, 20);
  doc.text("+91 123 456 7890", 14, 25);

  // Address in header (right aligned)
  doc.text("123 Main Street", pageWidth - 14, 15, { align: "right" });
  doc.text("Waligama", pageWidth - 14, 20, { align: "right" });
  doc.text("Sri Lanka", pageWidth - 14, 25, { align: "right" });

  // Title and timestamp
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 60);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), "MMMM dd, yyyy HH:mm")}`, 14, 67);

  // Table
  autoTable(doc, {
    head: columns ? [columns.map((col) => col.header)] : [],
    body: columns
      ? data.map((item) => columns.map((col) => String(item[col.dataKey])))
      : data.map((row) => Object.values(row).map(String)),
    startY: 75,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [70, 70, 70],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { top: 75 },
  });

  // Footer for each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer bar
    doc.setFillColor(240, 240, 240);
    doc.rect(0, pageHeight - 25, pageWidth, 25, "F");
    doc.setDrawColor(200, 200, 200);
    doc.line(0, pageHeight - 25, pageWidth, pageHeight - 25);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100);

    // Left section
    doc.text("Event Pro", 14, pageHeight - 16);
    doc.text("Professional Event Management", 14, pageHeight - 12);

    // Center section
    doc.text("Terms & Conditions Apply", pageWidth / 2, pageHeight - 16, {
      align: "center",
    });
    doc.text(
      "© 2024 Event Pro. All rights reserved.",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );

    // Right section
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 16, {
      align: "right",
    });
    doc.text("Confidential Document", pageWidth - 14, pageHeight - 12, {
      align: "right",
    });
  }

  doc.save(filename);
};
