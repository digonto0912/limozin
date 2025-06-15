import { NextResponse } from 'next/server';
import express from 'express';
import cors from 'cors';

// Initialize express app
const app = express();

// Import route handlers
const recordsRoutes = (req, res) => {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Handle GET /api/records
      return import('../../../backend/routes/records.js')
        .then(module => module.default.get(req, res));
    case 'POST':
      // Handle POST /api/records
      return import('../../../backend/routes/records.js')
        .then(module => module.default.post(req, res));
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
};

const recordRoute = (req, res) => {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Handle GET /api/record/:id
      return import('../../../backend/routes/record.js')
        .then(module => module.default.get(req, res));
    case 'PUT':
      // Handle PUT /api/record/:id
      return import('../../../backend/routes/record.js')
        .then(module => module.default.put(req, res));
    case 'DELETE':
      // Handle DELETE /api/record/:id
      return import('../../../backend/routes/record.js')
        .then(module => module.default.delete(req, res));
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Setup routes
app.use('/api/records', recordsRoutes);
app.use('/api/record', recordRoute);

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
    const url = '/api/' + params.path.join('/');
    const headers = Object.fromEntries(request.headers);
    const body = method === 'GET' ? undefined : await request.json().catch(() => undefined);

    return new Promise((resolve) => {
      const expressReq = {
        method,
        url,
        headers,
        body,
        params: {},
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

      // Parse the URL to get the path parameters
      const pathParts = params.path;
      if (pathParts[0] === 'records') {
        recordsRoutes(expressReq, expressRes);
      } else if (pathParts[0] === 'record') {
        expressReq.params.id = pathParts[1];
        recordRoute(expressReq, expressRes);
      } else {
        resolve(NextResponse.json({ error: 'Not found' }, { status: 404 }));
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
