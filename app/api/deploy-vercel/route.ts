import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

interface FileToUpload {
  path: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { files, vercelToken } = await request.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!vercelToken) {
      return NextResponse.json(
        { error: 'Vercel token is required' },
        { status: 400 }
      );
    }

    const fileMap: Record<string, { file: string }> = {};
    files.forEach((file: FileToUpload) => {
      fileMap[file.path] = {
        file: file.content
      };
    });

    const deploymentPayload = {
      name: `pludo-coder-${Date.now()}`,
      files: fileMap,
      projectSettings: {
        framework: null,
        buildCommand: null,
        outputDirectory: null
      },
      target: 'production'
    };

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deploymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vercel deployment error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Deployment failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const deploymentUrl = `https://${data.url}`;

    return NextResponse.json({
      url: deploymentUrl,
      deploymentId: data.id,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deploy' },
      { status: 500 }
    );
  }
}
