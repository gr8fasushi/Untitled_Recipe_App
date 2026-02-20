import { useUIStore } from './uiStore';

beforeEach(() => {
  useUIStore.setState({ isLoading: false, toastMessage: null, toastType: 'info' });
});

it('sets loading state', () => {
  const { setLoading } = useUIStore.getState();
  setLoading(true);
  expect(useUIStore.getState().isLoading).toBe(true);
  setLoading(false);
  expect(useUIStore.getState().isLoading).toBe(false);
});

it('shows toast with default type', () => {
  const { showToast } = useUIStore.getState();
  showToast('Hello world');
  expect(useUIStore.getState().toastMessage).toBe('Hello world');
  expect(useUIStore.getState().toastType).toBe('info');
});

it('shows toast with explicit type', () => {
  const { showToast } = useUIStore.getState();
  showToast('Saved!', 'success');
  expect(useUIStore.getState().toastType).toBe('success');
});

it('clears toast', () => {
  const { showToast, clearToast } = useUIStore.getState();
  showToast('Error', 'error');
  clearToast();
  expect(useUIStore.getState().toastMessage).toBeNull();
});
