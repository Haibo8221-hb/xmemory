import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get total memories count
    const { count: memoriesCount } = await supabase
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Get total downloads
    const { data: downloadData } = await supabase
      .from('memories')
      .select('download_count')
      .eq('status', 'active')
    
    const totalDownloads = downloadData?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0
    
    // Get total sellers
    const { data: sellersData } = await supabase
      .from('memories')
      .select('seller_id')
      .eq('status', 'active')
    
    const uniqueSellers = new Set(sellersData?.map(m => m.seller_id)).size
    
    // Get popular memories (most downloads)
    const { data: popularMemories } = await supabase
      .from('memories')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')
      .order('download_count', { ascending: false })
      .limit(4)
    
    // Get newest memories
    const { data: newestMemories } = await supabase
      .from('memories')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4)
    
    return NextResponse.json({
      stats: {
        memories: memoriesCount || 0,
        downloads: totalDownloads,
        sellers: uniqueSellers,
      },
      popularMemories: popularMemories || [],
      newestMemories: newestMemories || [],
    })
    
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ 
      stats: { memories: 0, downloads: 0, sellers: 0 },
      popularMemories: [],
      newestMemories: [],
    })
  }
}
