import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface NDAData {
  disclosingParty: {
    name: string;
    address: string;
  };
  receivingParty: {
    name: string;
    address: string;
  };
  date: string;
  purpose: string;
}

interface GeneratedDocument {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Simple text replacement in DOCX file
 * This function reads the template and replaces placeholders
 */
async function fillDocxTemplate(templatePath: string, data: NDAData): Promise<Buffer> {
  // Read the template file
  const templateBuffer = fs.readFileSync(templatePath);
  
  // Convert buffer to string for replacement (simple approach)
  // Note: This is a simplified approach. For complex DOCX, use docx-templates or mammoth
  let content = templateBuffer.toString('binary');
  
  // Replace all placeholders
  const replacements = {
    '{{date}}': data.date,
    '{{disclosingPartyName}}': data.disclosingParty.name,
    '{{disclosingPartyAddress}}': data.disclosingParty.address,
    '{{receivingPartyName}}': data.receivingParty.name,
    '{{receivingPartyAddress}}': data.receivingParty.address,
    '{{purpose}}': data.purpose,
  };

  // Replace all occurrences of each placeholder
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, value);
  });

  return Buffer.from(content, 'binary');
}

/**
 * Generate PDF version of NDA without requiring font files
 * Uses pdf-lib which works in serverless environments
 */
async function generateNDAPDF(data: NDAData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  // Use standard fonts (no external font files needed)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 20;
  
  // Title
  page.drawText('NON-DISCLOSURE AGREEMENT', {
    x: width / 2 - 150,
    y: yPosition,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= lineHeight * 2;
  
  // Date
  page.drawText(`This Agreement is made on ${data.date}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontRegular,
  });
  
  yPosition -= lineHeight * 1.5;
  
  // BETWEEN
  page.drawText('BETWEEN:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontBold,
  });
  
  yPosition -= lineHeight;
  
  // Disclosing Party
  page.drawText(`${data.disclosingParty.name} (the "Disclosing Party")`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText(`of ${data.disclosingParty.address}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight * 1.5;
  
  // AND
  page.drawText('AND', {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontBold,
  });
  
  yPosition -= lineHeight;
  
  // Receiving Party
  page.drawText(`${data.receivingParty.name} (the "Receiving Party")`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText(`of ${data.receivingParty.address}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight * 2;
  
  // Section 1: PURPOSE
  page.drawText('1. PURPOSE', {
    x: margin,
    y: yPosition,
    size: 13,
    font: fontBold,
  });
  
  yPosition -= lineHeight * 1.2;
  
  const purposeText = `The parties wish to explore a business opportunity relating to ${data.purpose}. In connection with this opportunity, the Disclosing Party may disclose certain confidential and proprietary information to the Receiving Party.`;
  
  // Wrap text
  const words = purposeText.split(' ');
  let line = '';
  const maxWidth = width - 2 * margin;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const testWidth = fontRegular.widthOfTextAtSize(testLine, 11);
    
    if (testWidth > maxWidth) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 11,
        font: fontRegular,
      });
      line = word + ' ';
      yPosition -= lineHeight;
    } else {
      line = testLine;
    }
  }
  
  if (line) {
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: 11,
      font: fontRegular,
    });
    yPosition -= lineHeight;
  }
  
  yPosition -= lineHeight;
  
  // Section 2: CONFIDENTIAL INFORMATION
  page.drawText('2. CONFIDENTIAL INFORMATION', {
    x: margin,
    y: yPosition,
    size: 13,
    font: fontBold,
  });
  
  yPosition -= lineHeight * 1.2;
  
  const confInfoText = '"Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.';
  
  // Wrap text for confidential information
  line = '';
  for (const word of confInfoText.split(' ')) {
    const testLine = line + word + ' ';
    const testWidth = fontRegular.widthOfTextAtSize(testLine, 11);
    
    if (testWidth > maxWidth) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 11,
        font: fontRegular,
      });
      line = word + ' ';
      yPosition -= lineHeight;
    } else {
      line = testLine;
    }
  }
  
  if (line) {
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: 11,
      font: fontRegular,
    });
    yPosition -= lineHeight;
  }
  
  yPosition -= lineHeight * 1.5;
  
  // Signatures
  page.drawText('SIGNATURES:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontBold,
  });
  
  yPosition -= lineHeight * 1.5;
  
  page.drawText(data.disclosingParty.name, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontBold,
  });
  
  yPosition -= lineHeight;
  
  page.drawText('Signature: _________________________', {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText('Date: _________________________', {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText(`Name: ${data.disclosingParty.name}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight * 2;
  
  page.drawText(data.receivingParty.name, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontBold,
  });
  
  yPosition -= lineHeight;
  
  page.drawText('Signature: _________________________', {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText('Date: _________________________', {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  yPosition -= lineHeight;
  
  page.drawText(`Name: ${data.receivingParty.name}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: fontRegular,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate NDA document in the requested format
 */
export async function generateNDADocument(
  data: NDAData,
  format: 'pdf' | 'docx'
): Promise<GeneratedDocument> {
  try {
    if (format === 'pdf') {
      const buffer = await generateNDAPDF(data);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `NDA-${data.disclosingParty.name.replace(/\s+/g, '_')}-${Date.now()}.pdf`,
      };
    } else {
      // DOCX format
      const templatePath = path.join(process.cwd(), 'docs', 'contracts', 'NON-DISCLOSURE AGREEMENT.docx');
      
      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        // Create template if it doesn't exist
        const { createNDATemplate } = await import('./create-nda-template');
        await createNDATemplate();
      }
      
      const buffer = await fillDocxTemplate(templatePath, data);
      
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: `NDA-${data.disclosingParty.name.replace(/\s+/g, '_')}-${Date.now()}.docx`,
      };
    }
  } catch (error) {
    console.error('Error generating NDA document:', error);
    throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
