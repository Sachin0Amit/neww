/**
 * Shannon - Config API Route
 * Validates and returns scan configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseConfig, distributeConfig, configToYaml } from '@/lib/shannon';

export async function POST(req: NextRequest) {
  try {
    const { config: configString } = await req.json();

    if (!configString) {
      return NextResponse.json({ error: 'Config string is required' }, { status: 400 });
    }

    const result = parseConfig(configString);

    if (result.ok) {
      const distributed = distributeConfig(result.value);
      return NextResponse.json({
        valid: true,
        config: result.value,
        distributed,
        yaml: configToYaml(result.value),
      });
    } else {
      return NextResponse.json({
        valid: false,
        error: result.error.message,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    schema: {
      fields: {
        authentication: { type: 'object', description: 'Authentication configuration' },
        rules: { type: 'object', description: 'Avoid/focus rules' },
        description: { type: 'string', description: 'Target description' },
        vuln_classes: { type: 'array', description: 'Vulnerability classes to test', options: ['injection', 'xss', 'auth', 'authz', 'ssrf'] },
        exploit: { type: 'string', description: 'Enable exploitation (true/false)' },
        report: { type: 'object', description: 'Report configuration' },
        rules_of_engagement: { type: 'string', description: 'Rules of engagement' },
      },
    },
    example: configToYaml({
      description: 'Example target application',
      vuln_classes: ['injection', 'xss', 'auth'],
      exploit: 'true',
      authentication: {
        login_type: 'form',
        login_url: 'https://example.com/login',
        credentials: { username: 'testuser', password: 'testpass' },
        success_condition: { type: 'url_contains', value: '/dashboard' },
      },
      rules: {
        avoid: [{ description: 'Avoid admin endpoints', type: 'url_path', value: '/admin/*' }],
        focus: [{ description: 'Focus on API endpoints', type: 'url_path', value: '/api/*' }],
      },
      report: { min_severity: 'medium', min_confidence: 'medium' },
    }),
  });
}
