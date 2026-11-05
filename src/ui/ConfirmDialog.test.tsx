import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConfirmDialog } from './ConfirmDialog';

const dialog = (visible: boolean, onConfirm = jest.fn(), onCancel = jest.fn()) => (
  <ConfirmDialog
    visible={visible}
    title="Libérer ce shikigami ?"
    body="Il quitte ta bande."
    confirmLabel="Oui"
    cancelLabel="Annuler"
    onConfirm={onConfirm}
    onCancel={onCancel}
    testID="confirm"
  />
);

describe('ConfirmDialog', () => {
  it('asks, then confirms or cancels', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(dialog(true, onConfirm, onCancel));
    expect(screen.getByText('Libérer ce shikigami ?')).toBeOnTheScreen();
    expect(screen.getByText('Il quitte ta bande.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Oui' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('confirm-no'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows nothing while hidden', async () => {
    await render(dialog(false));
    expect(screen.queryByTestId('confirm')).toBeNull();
  });
});
