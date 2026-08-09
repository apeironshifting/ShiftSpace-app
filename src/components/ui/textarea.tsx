import * as React from 'react';

import {cn} from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const adjustHeight = React.useCallback(() => {
        if (internalRef.current) {
            internalRef.current.style.height = 'auto';
            internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
        }
    }, []);
    
    const debouncedAdjustHeight = useDebouncedCallback(adjustHeight, 100);

    React.useEffect(() => {
        adjustHeight();
    }, [props.value, adjustHeight]);

    return (
      <textarea
        className={cn(
          'flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:text-sm',
          'resize-none overflow-hidden',
          className
        )}
        ref={internalRef}
        onChange={(e) => {
            debouncedAdjustHeight();
            props.onChange?.(e);
        }}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
