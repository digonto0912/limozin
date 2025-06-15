import { NextResponse } from 'next/server';
import app from '../../../backend/server.js';

export async function GET(request, { params }) {
  return handleRequest(request, params);
}

export async function POST(request, { params }) {
  return handleRequest(request, params);
}

export async function PUT(request, { params }) {
  return handleRequest(request, params);
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params);
}

async function handleRequest(request, { params }) {
  try {
    const method = request.method;
    const url = '/api/' + params.path.join('/');
    const headers = Object.fromEntries(request.headers);
    const body = method === 'GET' ? undefined : await request.json().catch(() => undefined);

    return new Promise((resolve) => {
      const expressReq = {
        method,
        url,
        headers,
        body,
        query: Object.fromEntries(new URL(request.url).searchParams),
      };

      const expressRes = {
        setHeader: () => {},
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          resolve(NextResponse.json(data, { status: this.statusCode || 200 }));
        },
        send: function(data) {
          resolve(new NextResponse(data, { status: this.statusCode || 200 }));
        }
      };

      app(expressReq, expressRes);
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
