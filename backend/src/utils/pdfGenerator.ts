import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
  trackingId: string;
  customerName: string;
  customerEmail: string;
  deviceType: string;
  deviceModel: string;
  issueDescription: string;
  price: number;
  date: Date;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const invoicesDir = path.join(__dirname, "../../invoices");
      
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filePath = path.join(invoicesDir, `${invoiceData.trackingId}.pdf`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text("WeFixIt Repair Services", { align: "center" })
        .moveDown();

      doc
        .fontSize(10)
        .text("123 Tech Street, Kathmandu, Nepal", { align: "center" })
        .text("Email: support@wefixit.com | Phone: +977-9800000000", { align: "center" })
        .moveDown(2);

      // Invoice Details
      doc.fontSize(16).text("Invoice / Receipt", { underline: true }).moveDown();
      
      doc.fontSize(12)
        .text(`Tracking ID: ${invoiceData.trackingId}`)
        .text(`Date: ${invoiceData.date.toLocaleDateString()}`)
        .moveDown();

      // Customer Details
      doc.text(`Customer Name: ${invoiceData.customerName}`)
        .text(`Email: ${invoiceData.customerEmail}`)
        .moveDown();

      // Repair Details
      doc.text("Repair Details", { underline: true }).moveDown(0.5);
      doc.text(`Device: ${invoiceData.deviceType} - ${invoiceData.deviceModel}`)
        .text(`Issue: ${invoiceData.issueDescription}`)
        .moveDown();

      // Pricing
      doc.fontSize(14).text(`Total Amount: Rs. ${invoiceData.price}`, { align: "right" });

      doc.moveDown(2);

      // Payment Info / QR
      const qrPath = path.join(__dirname, "../../assets/esewa-qr.png");
      if (fs.existsSync(qrPath)) {
        doc.fontSize(12).text("Scan to Pay (eSewa):", { underline: true }).moveDown(0.5);
        doc.image(qrPath, {
          fit: [150, 150],
          align: 'center',
          valign: 'center'
        });
        doc.fontSize(10).text("Shreekesh Devi | 9821166498", { align: "center" }).moveDown();
      } else {
        doc.fontSize(12).text("Payment Details:", { underline: true }).moveDown(0.5);
        doc.fontSize(10).text("eSewa ID: 9821166498 (Shreekesh Devi)", { align: "left" }).moveDown();
      }

      doc.moveDown(2);
      doc.fontSize(10).text("Thank you for choosing WeFixIt!", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });
      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
