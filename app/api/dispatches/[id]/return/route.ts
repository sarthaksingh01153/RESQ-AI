import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { recordReturn } from '@/lib/services/inventory.service';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN','RESCUE_TEAM','INVENTORY_MANAGER'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const {items} = await req.json();
    const dispatch = await recordReturn(params.id,items,user.sub);
    return NextResponse.json({dispatch,message:'Return recorded'});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Failed'},{status:400}); }
}

