// app/api/plans/route.js
import { getPlans } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const plans = await getPlans();
    console.log("plans ----> ", plans)
    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}