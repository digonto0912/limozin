import { NextResponse } from 'next/server';
import { handlers as recordsHandlers } from '../../../backend/routes/records.js';
import { handlers as recordHandler } from '../../../backend/routes/record.js';

// Logger function for API requests
const logAPIRequest = (method, params, url) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] API Request:`, {
    method,
    path: params.path.join('/'),
    url,
    envVars: {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      environment: process.env.NODE_ENV
    }
  });
};

// Logger function for API responses
const logAPIResponse = (method, path, status, data, error) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] API Response:`, {
    method,
    path,
    status,
    hasData: !!data,
    error: error ? {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : undefined
  });
};

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
  // Log incoming request
  logAPIRequest(method, params, request.url);

  try {
    const pathType = params.path[0]; // 'records' or 'record'
    const handlers = pathType === 'records' ? recordsHandlers : recordHandler;
    const handler = handlers[method.toLowerCase()];

    if (!handler) {
      const error = new Error('Method not allowed');
      logAPIResponse(method, params.path.join('/'), 405, null, error);
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Create Express-like request object
    const expressReq = {
      method,
      params: pathType === 'record' ? { id: params.path[1] } : {},
      query: Object.fromEntries(new URL(request.url).searchParams),
      body: method !== 'GET' ? await request.json().catch(() => ({})) : undefined
    };

    // Create Express-like response object with logging
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

    // Log successful response
    logAPIResponse(method, params.path.join('/'), statusCode, responseData);

    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    // Log error response
    logAPIResponse(method, params.path.join('/'), 500, null, error);
    
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
