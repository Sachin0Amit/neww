/**
 * Shannon - Setup API Route
 * Configures provider credentials
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, baseUrl, authToken, awsRegion, gcpRegion, gcpProjectId } = await req.json();

    // In a real implementation, this would securely store credentials
    // For now, we validate and acknowledge the configuration
    const supportedProviders = ['anthropic', 'custom_base_url', 'bedrock', 'vertex', 'z-ai-sdk'];

    if (!provider || !supportedProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Supported: ${supportedProviders.join(', ')}` },
        { status: 400 },
      );
    }

    // Validate required fields per provider
    if (provider === 'anthropic' && !apiKey) {
      return NextResponse.json({ error: 'API key is required for Anthropic' }, { status: 400 });
    }
    if (provider === 'custom_base_url' && (!baseUrl || !authToken)) {
      return NextResponse.json({ error: 'Base URL and auth token are required for custom provider' }, { status: 400 });
    }

    // Store configuration (in production, use secure credential storage)
    const config: Record<string, string> = { provider };

    if (apiKey) config.apiKey = 'configured';
    if (baseUrl) config.baseUrl = baseUrl;
    if (authToken) config.authToken = 'configured';
    if (awsRegion) config.awsRegion = awsRegion;
    if (gcpRegion) config.gcpRegion = gcpRegion;
    if (gcpProjectId) config.gcpProjectId = gcpProjectId;

    return NextResponse.json({
      success: true,
      message: `${provider} provider configured successfully`,
      provider,
      // Don't return actual keys for security
      configured: Object.keys(config),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to configure provider', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    providers: [
      {
        id: 'z-ai-sdk',
        name: 'Z.ai SDK (Default)',
        description: 'Built-in LLM provider using z-ai-web-dev-sdk',
        fields: [],
        configured: true,
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude models via Anthropic API',
        fields: ['apiKey'],
        configured: !!process.env.ANTHROPIC_API_KEY,
      },
      {
        id: 'custom_base_url',
        name: 'Custom Base URL',
        description: 'Any OpenAI-compatible API endpoint',
        fields: ['baseUrl', 'authToken'],
        configured: !!process.env.ANTHROPIC_BASE_URL,
      },
      {
        id: 'bedrock',
        name: 'AWS Bedrock',
        description: 'Claude via AWS Bedrock',
        fields: ['awsRegion'],
        configured: !!process.env.CLAUDE_CODE_USE_BEDROCK,
      },
      {
        id: 'vertex',
        name: 'Google Vertex AI',
        description: 'Claude via Google Vertex AI',
        fields: ['gcpRegion', 'gcpProjectId'],
        configured: !!process.env.CLAUDE_CODE_USE_VERTEX,
      },
    ],
  });
}
