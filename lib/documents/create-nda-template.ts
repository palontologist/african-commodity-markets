import { 
  Document, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  UnderlineType,
  Packer
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a proper NDA template document without duplication
 * This template uses placeholders that will be replaced with actual values
 */
export async function createNDATemplate() {
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
              text: '{{date}}',
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
              text: '{{disclosingPartyName}}',
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
              text: '{{disclosingPartyAddress}}',
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
              text: '{{receivingPartyName}}',
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
              text: '{{receivingPartyAddress}}',
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
              text: '{{purpose}}',
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
          text: '{{disclosingPartyName}}',
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
              text: '{{disclosingPartyName}}',
            }),
          ],
          spacing: {
            after: 300,
          },
        }),

        // Receiving Party Signature
        new Paragraph({
          text: '{{receivingPartyName}}',
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
              text: '{{receivingPartyName}}',
            }),
          ],
        }),
      ],
    }],
  });

  // Save the template
  const buffer = await Packer.toBuffer(doc);
  const templatePath = path.join(process.cwd(), 'docs', 'contracts', 'NON-DISCLOSURE AGREEMENT.docx');
  
  // Ensure directory exists
  const dir = path.dirname(templatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(templatePath, buffer);
  console.log('NDA template created at:', templatePath);
  
  return buffer;
}

// Export function to run directly
if (require.main === module) {
  createNDATemplate()
    .then(() => console.log('Template created successfully'))
    .catch((err) => console.error('Error creating template:', err));
}
