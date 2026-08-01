import { supabase } from './client';
import type { Block } from '@/hooks/use-scripts';

export type InfoSection = {
  id: string;
  title: string;
  blocks: Block[];
};

export async function fetchInfoSections(): Promise<InfoSection[]> {
  const { data, error } = await supabase
    .from('info_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    blocks: (row.blocks as Block[]) ?? [],
  }));
}

export async function saveInfoSections(sections: InfoSection[]): Promise<void> {
  const { data: existing } = await supabase.from('info_sections').select('id');
  const existingIds = new Set((existing ?? []).map((r) => r.id));
  const currentIds = new Set(sections.map((s) => s.id));

  const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from('info_sections').delete().in('id', toDelete);
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const payload = {
      id: section.id,
      title: section.title,
      blocks: section.blocks,
      sort_order: i,
      updated_at: new Date().toISOString(),
    };

    if (existingIds.has(section.id)) {
      await supabase.from('info_sections').update(payload).eq('id', section.id);
    } else {
      await supabase.from('info_sections').insert(payload);
    }
  }
}
