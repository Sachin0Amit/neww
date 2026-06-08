/**
 * OSIRIS Tools API Route
 * GET /api/osiris/tools
 *
 * Lists all 14 recon tools with their descriptions and categories.
 */

import { NextResponse } from 'next/server';
import { RECON_TOOLS } from '@/lib/osiris/recon-tools';

export async function GET() {
  try {
    const tools = RECON_TOOLS.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
    }));

    // Group by category
    const categories = tools.reduce<Record<string, typeof tools>>((acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        tools,
        categories,
        totalTools: tools.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to list tools',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 },
    );
  }
}
