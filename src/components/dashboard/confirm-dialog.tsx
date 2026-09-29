'use client';

/**
 * In-app replacement for window.confirm / window.prompt in the back office.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title: 'Supprimer ?', tone: 'danger' }))) return;
 *
 * `requireText` makes the user type a word (e.g. "SUPPRIMER") before the
 * confirm button unlocks, for irreversible actions.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { btn, inputClass } from './ui';

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  requireText?: string;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [typed, setTyped] = useState('');
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    setTyped('');
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  };

  const isDanger = options?.tone === 'danger';
  const locked = !!options?.requireText && typed.trim() !== options.requireText;
  const Icon = isDanger ? AlertTriangle : HelpCircle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog.Root open={!!options} onOpenChange={(open) => !open && close(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-900/10 focus:outline-none data-[state=open]:animate-slide-up"
          >
            {options && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!locked) close(true);
                }}
              >
                <div className="flex gap-4">
                  <span
                    className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      isDanger ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Dialog.Title className="font-display text-base font-semibold text-gray-900">
                      {options.title}
                    </Dialog.Title>
                    {options.description ? (
                      <Dialog.Description asChild>
                        <div className="mt-1.5 text-sm leading-relaxed text-gray-600">{options.description}</div>
                      </Dialog.Description>
                    ) : (
                      <Dialog.Description className="sr-only">{options.title}</Dialog.Description>
                    )}
                    {options.requireText && (
                      <div className="mt-4">
                        <label htmlFor="confirm-text" className="mb-1.5 block text-sm text-gray-700">
                          Tapez <span className="font-mono font-semibold text-gray-900">{options.requireText}</span> pour confirmer
                        </label>
                        <input
                          id="confirm-text"
                          autoFocus
                          autoComplete="off"
                          value={typed}
                          onChange={(e) => setTyped(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => close(false)} className={btn.secondary}>
                    {options.cancelLabel || 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    disabled={locked}
                    autoFocus={!options.requireText}
                    className={isDanger ? btn.danger : btn.primary}
                  >
                    {options.confirmLabel || 'Confirmer'}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Fallback so a page rendered outside the provider still works.
    return async (opts) => window.confirm(opts.title);
  }
  return ctx;
}
