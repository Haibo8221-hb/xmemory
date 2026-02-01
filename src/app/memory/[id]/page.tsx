import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MemoryDetail } from '@/components/memory/memory-detail'

interface MemoryPageProps {
  params: Promise<{ id: string }>
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: memory } = await supabase
    .from('memories')
    .select('*, seller:profiles(*)')
    .eq('id', id)
    .single()
  
  if (!memory) {
    notFound()
  }
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, buyer:profiles(*)')
    .eq('memory_id', id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return <MemoryDetail memory={memory} reviews={reviews || []} />
}
