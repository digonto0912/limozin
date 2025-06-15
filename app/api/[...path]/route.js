import { NextResponse } from 'next/server';
import { handlers as recordsHandlers } from '../../../backend/routes/records.js';
import { handlers as recordHandler } from '../../../backend/routes/record.js';

export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(request, { params }, method) {
  try {
    // Log request details for debugging
    console.log('API Request:', {
      method,
      path: params.path,
      url: request.url,
      hasEnvVars: {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    });

    const pathType = params.path[0]; // 'records' or 'record'
    const handlers = pathType === 'records' ? recordsHandlers : recordHandler;
    const handler = handlers[method.toLowerCase()];

    if (!handler) {
      console.error('No handler found for method:', method);
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Create Express-like request object
    const expressReq = {
      method,
      params: pathType === 'record' ? { id: params.path[1] } : {},
      query: Object.fromEntries(new URL(request.url).searchParams),
      body: method !== 'GET' ? await request.json().catch(() => ({})) : undefined
    };

    // Create Express-like response object
    let statusCode = 200;
    let responseData = null;

    const expressRes = {
      status: (code) => {
        statusCode = code;
        return expressRes;
      },
      json: (data) => {
        responseData = data;
      },
      send: (data) => {
        responseData = data;
      }
    };

    // Execute the handler
    await handler(expressReq, expressRes);

    // Log response for debugging
    console.log('API Response:', {
      statusCode,
      hasData: !!responseData
    });

    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
