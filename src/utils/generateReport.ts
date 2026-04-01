import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CropRecommendation {
  crop: string;
  confidence: number;
  predictedYield: number;
  predictedPrice: number;
  yieldTrend?: number;
  districtAvgYield?: number;
  plantingTime?: string;
  harvestTime?: string;
  fertilizers?: string;
  irrigationSchedule?: string;
  pestControl?: string;
}

interface ReportInput {
  recommendations: CropRecommendation[];
  district?: string;
  state?: string;
}

export function generateRecommendationReport({ recommendations, district, state }: ReportInput) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header background
  doc.setFillColor(34, 120, 69);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Crop Recommendation Report", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Crop Decision Support System", pageWidth / 2, 27, { align: "center" });

  const locationText = district && state ? `${district}, ${state}` : "India";
  doc.text(`Location: ${locationText}  |  Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 36, { align: "center" });

  y = 52;
  doc.setTextColor(0, 0, 0);

  // Summary table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Recommendations Summary", 14, y);
  y += 8;

  const summaryBody = recommendations.map((rec, i) => {
    const rank = i === 0 ? "Best Choice" : i === 1 ? "Alternative" : "Option";
    const revenue = ((rec.predictedYield || 0) * 10 * (rec.predictedPrice || 0));
    const cost = revenue * 0.4;
    const profit = revenue * 0.6;
    return [
      rank,
      rec.crop,
      `${rec.confidence}%`,
      `${(rec.predictedYield || 0).toFixed(2)} t/ha`,
      `Rs.${(rec.predictedPrice || 0).toFixed(0)}/q`,
      `Rs.${profit.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Rank", "Crop", "Confidence", "Yield", "Price", "Est. Net Profit"]],
    body: summaryBody,
    theme: "grid",
    headStyles: { fillColor: [34, 120, 69], fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 28 },
      5: { fontStyle: "bold" },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Detailed sections for each crop
  recommendations.forEach((rec, index) => {
    // Check if we need a new page
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    // Crop header
    doc.setFillColor(240, 247, 240);
    doc.rect(14, y - 5, pageWidth - 28, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 120, 69);
    const rankLabel = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
    doc.text(`${index + 1}. ${rec.crop} (${rec.confidence}% Match)`, 16, y + 2);
    y += 14;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Financial details
    const revenue = (rec.predictedYield || 0) * 10 * (rec.predictedPrice || 0);
    const details = [
      ["Expected Yield", `${(rec.predictedYield || 0).toFixed(2)} tons/ha`],
      ["Market Price", `Rs.${(rec.predictedPrice || 0).toFixed(0)} per quintal`],
      ["Est. Production Cost", `Rs.${(revenue * 0.4).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`],
      ["Est. Selling Price", `Rs.${revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`],
      ["Est. Net Profit", `Rs.${(revenue * 0.6).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`],
    ];

    if (rec.yieldTrend !== undefined && rec.yieldTrend !== 0) {
      details.push(["Yield Trend vs District Avg", `${rec.yieldTrend > 0 ? "+" : ""}${rec.yieldTrend}%`]);
    }

    autoTable(doc, {
      startY: y,
      body: details,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, textColor: [80, 80, 80] },
        1: { cellWidth: 80 },
      },
      margin: { left: 16 },
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // Cultivation guide
    const guideRows: string[][] = [];
    if (rec.plantingTime) guideRows.push(["Planting Time", rec.plantingTime]);
    if (rec.harvestTime) guideRows.push(["Harvest Time", rec.harvestTime]);
    if (rec.fertilizers) guideRows.push(["Fertilizers", rec.fertilizers]);
    if (rec.irrigationSchedule) guideRows.push(["Irrigation", rec.irrigationSchedule]);
    if (rec.pestControl) guideRows.push(["Pest Control", rec.pestControl]);

    if (guideRows.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Cultivation Guide", 16, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        body: guideRows,
        theme: "striped",
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 35, fillColor: [240, 247, 240] },
          1: { cellWidth: 140 },
        },
        margin: { left: 16, right: 16 },
      });

      y = (doc as any).lastAutoTable.finalY + 12;
    } else {
      y += 6;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by Crop Decision Support System | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Download
  const filename = `Crop_Report_${locationText.replace(/[,\s]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
