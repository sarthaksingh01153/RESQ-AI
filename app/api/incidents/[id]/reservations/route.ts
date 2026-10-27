import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createResourceReservation } from '@/lib/services/inventory.service';
import { z } from 'zod';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const {items} = z.object({items:z.array(z.object({itemId:z.string(),quantity:z.number().int().positive(),reason:z.string().optional()})).min(1)}).parse(await req.json());
    const reservation = await createResourceReservation(params.id,items,user.sub);
    return NextResponse.json({reservation},{status:201});
  } catch(e) {
    if (e instanceof z.ZodError) return NextResponse.json({error:'Validation error'},{status:400});
    return NextResponse.json({error:e instanceof Error?e.message:'Failed'},{status:400});
  }
}

