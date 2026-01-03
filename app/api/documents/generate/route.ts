import { NextRequest, NextResponse } from 'next/server';
import { generateNDADocument } from '@/lib/documents/nda-generator';

export const dynamic = 'force-dynamic';

interface DocumentRequest {
  type: 'nda' | 'contract';
  format: 'pdf' | 'docx';
  data: {
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
  };
}

/**
 * POST /api/documents/generate
 * Generate legal documents (NDA, contracts) in PDF or DOCX format
 */
export async function POST(request: NextRequest) {
  try {
    const body: DocumentRequest = await request.json();
    const { type, format, data } = body;

    // Validate required fields
    if (!type || !format || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate document type
    if (type !== 'nda' && type !== 'contract') {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate format
    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Use "pdf" or "docx"' },
        { status: 400 }
      );
    }

    // Validate data fields
    if (!data.disclosingParty?.name || !data.disclosingParty?.address ||
        !data.receivingParty?.name || !data.receivingParty?.address ||
        !data.date || !data.purpose) {
      return NextResponse.json(
        { success: false, error: 'Missing required data fields' },
        { status: 400 }
      );
    }

    // Generate document based on type
    let buffer: Buffer;
    let mimeType: string;
    let filename: string;

    if (type === 'nda') {
      const result = await generateNDADocument(data, format);
      buffer = result.buffer;
      mimeType = result.mimeType;
      filename = result.filename;
    } else {
      return NextResponse.json(
        { success: false, error: 'Contract generation not yet implemented' },
        { status: 501 }
      );
    }

    // Return the document as a downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Document generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate document',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
