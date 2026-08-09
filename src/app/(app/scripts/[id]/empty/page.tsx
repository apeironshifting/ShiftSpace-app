

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { useScripts, type Script } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey } from '@/lib/utils';
import { BlockEditor } from '@/components/block-editor';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function EmptyScriptContent({ script: currentScript }: { script: Script }) {
  const { t } = useLanguage();
  const { updateScript } = useScripts();
  const [script, setScript] = useState(currentScript);
  const [isCoverDialog, setIsCoverDialog] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    setScript(currentScript);
  }, [currentScript]);

  const handleUpdate = (updates: Partial<Script>) => {
    updateScript(script.id, updates);
  };
  
  const displayTitle = isTranslationKey(script.title) ? t(script.title) : script.title;
  
  const handleCoverSave = () => {
    handleUpdate({ coverImage: coverUrl });
    setIsCoverDialog(false);
  };


  return (
      <div className="pb-12">
           <div className="relative h-48 w-full group">
            {script.coverImage ? (
              <>
                <Image
                  src={script.coverImage}
                  alt={t('script_page.cover_image_alt')}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" onClick={() => { setCoverUrl(script.coverImage || ''); setIsCoverDialog(true); }}>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {t('script_page.change_cover')}
                    </Button>
                </div>
              </>
            ) : (
              <div className="bg-muted h-full flex items-center justify-center border-b">
                <Button variant="secondary" onClick={() => { setCoverUrl(''); setIsCoverDialog(true); }}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t('script_page.add_cover')}
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
              <Input
                  value={displayTitle}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  placeholder={t('defaults.untitled_script')}
                  className="text-3xl sm:text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
              />
              <div className="mt-8">
                <BlockEditor 
                  initialBlocks={script.extraContent || []}
                  onUpdate={(newBlocks) => updateScript(script.id, { extraContent: newBlocks })}
                  scriptId={script.id}
                />
              </div>
          </div>
          <Dialog open={isCoverDialog} onOpenChange={setIsCoverDialog}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Update Cover Image</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                      <Label htmlFor="coverUrl">Image URL</Label>
                      <Input id="coverUrl" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsCoverDialog(false)}>Cancel</Button>
                      <Button onClick={handleCoverSave}>Save</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
      </div>
  );
}


export default function EmptyScriptPageWrapper({ params: rawParams }: { params: { id: string } }) {
  const router = useRouter();
  const params = React.use(rawParams);
  const { id } = params;
  const { scripts } = useScripts();
  const [script, setScript] = useState<Script | null>(null);

  useEffect(() => {
    const foundScript = scripts.find(s => s.id === id);
    if (foundScript) {
      if (!foundScript.isEmpty) {
        router.replace(`/scripts/${id}`);
        return;
      }
      setScript(foundScript);
    }
  }, [id, scripts, router]);

  if (!script) {
    return null; // or a loading skeleton
  }

  return <EmptyScriptContent script={script} />;
}
