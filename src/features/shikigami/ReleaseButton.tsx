import { useState } from 'react';

import { strings } from '@/i18n';
import { Button, ConfirmDialog } from '@/ui';

export interface ReleaseButtonProps {
  readonly name: string;
  /** Souls the shikigami leaves, already formatted. */
  readonly souls: string;
  readonly onRelease: () => void;
}

/** Releases one shikigami for its souls, after a confirmation. */
export function ReleaseButton({ name, souls, onRelease }: ReleaseButtonProps) {
  const text = strings.shikigami;
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button
        label={text.release(souls)}
        accessibilityLabel={text.releaseLabel(souls)}
        variant="neutral"
        onPress={() => setConfirming(true)}
        testID="shikigami-release"
      />
      <ConfirmDialog
        visible={confirming}
        title={text.releaseTitle(name)}
        body={text.releaseBody(souls)}
        confirmLabel={text.releaseConfirm}
        cancelLabel={text.releaseCancel}
        onConfirm={() => {
          setConfirming(false);
          onRelease();
        }}
        onCancel={() => setConfirming(false)}
        testID="shikigami-release-confirm"
      />
    </>
  );
}
