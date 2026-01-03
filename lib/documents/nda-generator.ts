import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel 
} from 'docx';

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
 * Generate DOCX directly with the data (no template file reading needed)
 * This ensures no duplication and clean formatting
 */
async function generateDocxDocument(data: NDAData): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: 'NON-DISCLOSURE AGREEMENT',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),

        // Date
        new Paragraph({
          children: [
            new TextRun({
              text: 'This Agreement is made on ',
            }),
            new TextRun({
              text: data.date,
              bold: true,
            }),
          ],
          spacing: {
            after: 200,
          },
        }),

        // Between section
        new Paragraph({
          text: 'BETWEEN:',
          bold: true,
          spacing: {
            before: 200,
            after: 100,
          },
        }),

        // Disclosing Party
        new Paragraph({
          children: [
            new TextRun({
              text: data.disclosingParty.name,
              bold: true,
            }),
            new TextRun({
              text: ' (the "Disclosing Party")',
            }),
          ],
          spacing: {
            after: 50,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'of ',
            }),
            new TextRun({
              text: data.disclosingParty.address,
              bold: true,
            }),
          ],
          spacing: {
            after: 200,
          },
        }),

        // And section
        new Paragraph({
          text: 'AND',
          bold: true,
          spacing: {
            after: 100,
          },
        }),

        // Receiving Party
        new Paragraph({
          children: [
            new TextRun({
              text: data.receivingParty.name,
              bold: true,
            }),
            new TextRun({
              text: ' (the "Receiving Party")',
            }),
          ],
          spacing: {
            after: 50,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'of ',
            }),
            new TextRun({
              text: data.receivingParty.address,
              bold: true,
            }),
          ],
          spacing: {
            after: 400,
          },
        }),

        // Section 1: Purpose
        new Paragraph({
          text: '1. PURPOSE',
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 200,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'The parties wish to explore a business opportunity relating to ',
            }),
            new TextRun({
              text: data.purpose,
              bold: true,
            }),
            new TextRun({
              text: '. In connection with this opportunity, the Disclosing Party may disclose certain confidential and proprietary information to the Receiving Party.',
            }),
          ],
          spacing: {
            after: 300,
          },
        }),

        // Section 2: Confidential Information
        new Paragraph({
          text: '2. CONFIDENTIAL INFORMATION',
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 200,
          },
        }),

        new Paragraph({
          text: '"Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.',
          spacing: {
            after: 300,
          },
        }),

        // Section 3: Obligations
        new Paragraph({
          text: '3. OBLIGATIONS',
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 200,
          },
        }),

        new Paragraph({
          text: 'The Receiving Party agrees to:',
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          text: 'a) Keep the Confidential Information confidential and not disclose it to any third party;',
          spacing: {
            after: 100,
            before: 100,
          },
          indent: {
            left: 720,
          },
        }),

        new Paragraph({
          text: 'b) Use the Confidential Information only for the Purpose;',
          spacing: {
            after: 100,
          },
          indent: {
            left: 720,
          },
        }),

        new Paragraph({
          text: 'c) Protect the Confidential Information with the same degree of care as it protects its own confidential information.',
          spacing: {
            after: 300,
          },
          indent: {
            left: 720,
          },
        }),

        // Section 4: Term
        new Paragraph({
          text: '4. TERM',
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 300,
            after: 200,
          },
        }),

        new Paragraph({
          text: 'This Agreement shall remain in effect for a period of two (2) years from the date of execution.',
          spacing: {
            after: 400,
          },
        }),

        // Signatures Section
        new Paragraph({
          text: 'SIGNATURES:',
          bold: true,
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        // Disclosing Party Signature
        new Paragraph({
          text: data.disclosingParty.name,
          bold: true,
          spacing: {
            before: 200,
            after: 100,
          },
        }),

        new Paragraph({
          text: 'Signature: _________________________',
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          text: 'Date: _________________________',
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Name: ',
            }),
            new TextRun({
              text: data.disclosingParty.name,
            }),
          ],
          spacing: {
            after: 300,
          },
        }),

        // Receiving Party Signature
        new Paragraph({
          text: data.receivingParty.name,
          bold: true,
          spacing: {
            before: 200,
            after: 100,
          },
        }),

        new Paragraph({
          text: 'Signature: _________________________',
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          text: 'Date: _________________________',
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Name: ',
            }),
            new TextRun({
              text: data.receivingParty.name,
            }),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
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
 * Sanitize filename to prevent path traversal and filesystem issues
 */
function sanitizeFilename(name: string): string {
  // Remove any path components and special characters
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace special chars with underscore
    .replace(/_{2,}/g, '_')            // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '')          // Trim underscores from start/end
    .substring(0, 50);                // Limit length
}

/**
 * Generate NDA document in the requested format
 */
export async function generateNDADocument(
  data: NDAData,
  format: 'pdf' | 'docx'
): Promise<GeneratedDocument> {
  try {
    const safeFilename = sanitizeFilename(data.disclosingParty.name);
    const timestamp = Date.now();
    
    if (format === 'pdf') {
      const buffer = await generateNDAPDF(data);
      return {
        buffer,
        mimeType: 'application/pdf',
        filename: `NDA-${safeFilename}-${timestamp}.pdf`,
      };
    } else {
      // DOCX format - generate directly without template
      const buffer = await generateDocxDocument(data);
      
      return {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: `NDA-${safeFilename}-${timestamp}.docx`,
      };
    }
  } catch (error) {
    console.error('Error generating NDA document:', error);
    throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
