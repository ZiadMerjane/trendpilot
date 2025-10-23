import { NextResponse } from 'next/server';
import { repoFetchIdeas, repoUpsertIdeas } from '@/lib/repo';
import { getSignals } from '@/lib/signals';

// Rate limit to 2 requests per second
const limiter = { active: false, last: 0 };
async function rateLimit() {
  if (limiter.active) return true;
  const now = Date.now();
  if (now - limiter.last < 500) return true;
  limiter.active = true;
  limiter.last = now;
  await new Promise(resolve => setTimeout(resolve, 500));
  limiter.active = false;
  return false;
}

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all stored ideas
    const ideas = await repoFetchIdeas();
    
    // Update signals for each idea
    const updated = await Promise.all(
      ideas.map(async idea => {
        // Rate limit API calls
        while(await rateLimit()) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Get fresh signals
        const signals = await getSignals(idea.title);
        
        // Update idea with new signals
        return {
          ...idea,
          signals,
          updated_at: new Date().toISOString()
        };
      })
    );

    // Store updated ideas
    await repoUpsertIdeas(updated);

    return NextResponse.json({ 
      success: true, 
      updated: updated.length 
    });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { 
      status: 500 
    });
  }
}