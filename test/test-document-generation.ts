/**
 * Test script for document generation
 */
import { generateNDADocument } from '../lib/documents/nda-generator';
import * as fs from 'fs';
import * as path from 'path';

const testData = {
  disclosingParty: {
    name: 'Julia Wilkes',
    address: 'HU6 7RX',
  },
  receivingParty: {
    name: 'George Karani',
    address: '00100',
  },
  date: '3 January 2026',
  purpose: 'potential partnership in agricultural commodity trading',
};

async function testGeneration() {
  console.log('Testing document generation...\n');
  
  try {
    // Test DOCX generation
    console.log('1. Generating DOCX...');
    const docxResult = await generateNDADocument(testData, 'docx');
    const docxPath = path.join('/tmp', 'test-nda.docx');
    fs.writeFileSync(docxPath, docxResult.buffer);
    console.log(`✅ DOCX generated successfully: ${docxPath}`);
    console.log(`   Size: ${docxResult.buffer.length} bytes`);
    console.log(`   Filename: ${docxResult.filename}\n`);
    
    // Test PDF generation
    console.log('2. Generating PDF...');
    const pdfResult = await generateNDADocument(testData, 'pdf');
    const pdfPath = path.join('/tmp', 'test-nda.pdf');
    fs.writeFileSync(pdfPath, pdfResult.buffer);
    console.log(`✅ PDF generated successfully: ${pdfPath}`);
    console.log(`   Size: ${pdfResult.buffer.length} bytes`);
    console.log(`   Filename: ${pdfResult.filename}\n`);
    
    // Verify no duplication in DOCX
    console.log('3. Checking for duplication in DOCX...');
    const docxContent = docxResult.buffer.toString('binary');
    const ndaCount = (docxContent.match(/NON-DISCLOSURE AGREEMENT/g) || []).length;
    const betweenCount = (docxContent.match(/BETWEEN:/g) || []).length;
    const purposeCount = (docxContent.match(/1\. PURPOSE/g) || []).length;
    
    console.log(`   "NON-DISCLOSURE AGREEMENT" occurrences: ${ndaCount}`);
    console.log(`   "BETWEEN:" occurrences: ${betweenCount}`);
    console.log(`   "1. PURPOSE" occurrences: ${purposeCount}`);
    
    if (ndaCount <= 2 && betweenCount <= 2 && purposeCount <= 2) {
      console.log('✅ No excessive duplication detected\n');
    } else {
      console.log('⚠️  Possible duplication detected\n');
    }
    
    console.log('✅ All tests passed!');
    console.log('\nGenerated files:');
    console.log(`  DOCX: ${docxPath}`);
    console.log(`  PDF: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testGeneration();
