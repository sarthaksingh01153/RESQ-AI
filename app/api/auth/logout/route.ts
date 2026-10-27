import { NextResponse } from 'next/server';
export async function POST() {
  const r = NextResponse.json({message:'Logged out'});
  r.cookies.delete('resq_token');
  return r;
}

