import React from 'react';
import { render, screen, fireEvent } from '../../test/utils/render';
import DebugPanel from '@/components/DebugPanel';
import { crashLogger } from '@/lib/crashLogger';

jest.mock('@/lib/crashLogger', () => ({
  crashLogger: {
    getLogs: jest.fn(() => []),
  },
}));

describe('DebugPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crashLogger.getLogs as jest.Mock).mockReturnValue([]);
  });

  it('renders without crashing', () => {
    render(<DebugPanel />);
  });

  it('does not show panel initially', () => {
    render(<DebugPanel />);
    
    expect(screen.queryByText('Crash Debug Logs')).not.toBeInTheDocument();
  });

  it('opens panel after 3 quick clicks', () => {
    render(<DebugPanel />);
    
    // Click 3 times quickly
    fireEvent.click(window);
    fireEvent.click(window);
    fireEvent.click(window);
    
    expect(screen.getByText('Crash Debug Logs')).toBeInTheDocument();
  });

  it('toggles panel with keyboard shortcut Ctrl+Shift+D', () => {
    render(<DebugPanel />);
    
    // Open with keyboard shortcut
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    
    expect(screen.getByText('Crash Debug Logs')).toBeInTheDocument();
    
    // Close with keyboard shortcut
    fireEvent.keyDown(window, { key: 'D', ctrlKey: true, shiftKey: true });
    
    expect(screen.queryByText('Crash Debug Logs')).not.toBeInTheDocument();
  });

  it('toggles panel with keyboard shortcut Cmd+Shift+D', () => {
    render(<DebugPanel />);
    
    // Open with Mac keyboard shortcut
    fireEvent.keyDown(window, { key: 'D', metaKey: true, shiftKey: true });
    
    expect(screen.getByText('Crash Debug Logs')).toBeInTheDocument();
  });

  it('loads crash logs when panel opens', () => {
    render(<DebugPanel />);
    
    // Open panel
    fireEvent.click(window);
    fireEvent.click(window);
    fireEvent.click(window);
    
    expect(crashLogger.getLogs).toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = render(<DebugPanel />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});
