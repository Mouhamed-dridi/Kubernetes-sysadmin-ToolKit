import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import staticFigures from '@/lib/figures';

const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOM_FILE = path.join(DATA_DIR, 'custom-figures.json');

async function getCustomFigures() {
  try {
    const data = await fs.readFile(CUSTOM_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCustomFigures(figures: unknown[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CUSTOM_FILE, JSON.stringify(figures, null, 2));
}

export async function GET() {
  const custom = await getCustomFigures();
  return NextResponse.json([...staticFigures, ...custom]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const custom = await getCustomFigures();

  const newFigure = {
    id: Date.now(),
    name: body.name,
    price: body.price,
    image: body.image,
    category: 'Custom',
  };

  custom.push(newFigure);
  await saveCustomFigures(custom);

  return NextResponse.json(newFigure, { status: 201 });
}
