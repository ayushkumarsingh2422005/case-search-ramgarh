import { NextRequest, NextResponse } from 'next/server';
import { connectDB, InvestigatingOfficer } from '../../../models';

function verifyAuth(request: NextRequest): { ok: false; status: number; error: string } | { ok: true } {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return { ok: false, status: 401, error: 'Unauthorized. Please login.' };
  }
  const jwt = require('jsonwebtoken');
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return { ok: true };
  } catch {
    return { ok: false, status: 401, error: 'Unauthorized. Invalid token.' };
  }
}

async function requireSuperAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 }) };
  }
  const jwt = require('jsonwebtoken');
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string };
  } catch {
    return { ok: false as const, response: NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 }) };
  }
  await connectDB();
  const User = require('../../../models').User;
  const user = await User.findById(decoded.userId);
  if (!user || user.role !== 'SuperAdmin') {
    return {
      ok: false as const,
      response: NextResponse.json({ success: false, error: 'Forbidden. SuperAdmin access required.' }, { status: 403 }),
    };
  }
  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const filter: Record<string, unknown> = {};
    if (!includeInactive) {
      filter.isActive = true;
    }

    const officers = await InvestigatingOfficer.find(filter).sort({ name: 1 }).lean();

    if (!includeInactive) {
      return NextResponse.json({
        success: true,
        data: officers.map((o) => o.name),
      });
    }

    return NextResponse.json({
      success: true,
      data: officers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch investigating officers';
    console.error('Error fetching investigating officers:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const { name, createdBy } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const officer = new InvestigatingOfficer({
      name: name.trim(),
      createdBy: createdBy || 'Admin',
      isActive: true,
    });
    await officer.save();

    return NextResponse.json({ success: true, data: officer });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return NextResponse.json({ success: false, error: 'Investigating officer already exists' }, { status: 400 });
    }
    console.error('Error creating investigating officer:', error);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const { id, name, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = typeof name === 'string' ? name.trim() : name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const officer = await InvestigatingOfficer.findByIdAndUpdate(id, updateData, { new: true });

    if (!officer) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: officer });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return NextResponse.json({ success: false, error: 'Name already exists' }, { status: 400 });
    }
    console.error('Error updating investigating officer:', error);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin.ok) return admin.response;

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const officer = await InvestigatingOfficer.findByIdAndDelete(id);
    if (!officer) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete';
    console.error('Error deleting investigating officer:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
