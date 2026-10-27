import { NextRequest, NextResponse } from 'next/server';
import { getSafetyGuidance, SAFETY_LIBRARY } from '@/lib/safety-guidance';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  
  if (type) {
    const guidance = getSafetyGuidance(type.toUpperCase());
    return NextResponse.json({ guidance, isReviewed: true, source: guidance.officialSource });
  }
  
  // Return all types summary
  const all = Object.values(SAFETY_LIBRARY).map(g => ({
    type: g.type,
    label: g.label,
    icon: g.icon,
    callNumbers: g.callNumbers,
    officialSource: g.officialSource,
  }));
  return NextResponse.json({ types: all, isReviewed: true });
}

