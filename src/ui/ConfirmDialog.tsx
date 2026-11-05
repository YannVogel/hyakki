import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { bodyText, displayText } from './styles';
import { spacing } from './tokens';

export interface ConfirmDialogProps {
  readonly visible: boolean;
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** Prefix of the dialog's test ids: `<testID>`, `<testID>-yes`, `<testID>-no`. */
  readonly testID: string;
}

/** Asks before an action that cannot be undone: a red « yes », a neutral « cancel ». */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  testID,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Card large style={styles.dialog} testID={testID}>
          <Text style={displayText('2xl')}>{title}</Text>
          <Text style={bodyText('base', 700)}>{body}</Text>
          <Button
            label={confirmLabel}
            variant="danger"
            onPress={onConfirm}
            sound="purchase"
            testID={`${testID}-yes`}
          />
          <Button
            label={cancelLabel}
            variant="neutral"
            onPress={onCancel}
            testID={`${testID}-no`}
          />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing[5] },
  dialog: { gap: spacing[3], padding: spacing[5] },
});
