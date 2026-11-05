import { type ReactNode, useEffect, useRef } from 'react';
import {
  type DimensionValue,
  Modal,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from './Card';
import { spacing } from './tokens';

export interface SheetProps {
  readonly children: ReactNode;
  /** Always in view under the scrolling content: it holds the way out of the sheet. */
  readonly footer: ReactNode;
  readonly onRequestClose: () => void;
  /** Share of the screen height the sheet may take (it shrinks to a short content). */
  readonly maxHeight: DimensionValue;
  readonly testID?: string;
}

/** Card sliding up from the bottom, above the home indicator: its content scrolls, not its footer. */
export function Sheet({ children, footer, onRequestClose, maxHeight, testID }: SheetProps) {
  const scroll = useRef<ScrollViewInstance>(null);
  // iOS hides its scroll indicator at rest: flash it so a long content shows it goes on below.
  useEffect(() => scroll.current?.flashScrollIndicators(), []);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onRequestClose}>
      <SafeAreaView edges={['bottom']} style={styles.backdrop}>
        <Card large style={{ maxHeight }} testID={testID}>
          <ScrollView ref={scroll} persistentScrollbar testID={testID && `${testID}-scroll`}>
            {children}
          </ScrollView>
          {footer}
        </Card>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', padding: spacing[3] },
});
