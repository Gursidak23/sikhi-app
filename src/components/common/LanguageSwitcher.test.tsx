import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  const mockOnLanguageChange = vi.fn();

  beforeEach(() => {
    mockOnLanguageChange.mockClear();
  });

  it('renders with default language', () => {
    render(<LanguageSwitcher currentLanguage="pa" onLanguageChange={mockOnLanguageChange} />);
    
    // Should render multiple language buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays current language as selected', () => {
    render(<LanguageSwitcher currentLanguage="en" onLanguageChange={mockOnLanguageChange} />);
    
    // The English button should have aria-current="true"
    const englishButton = screen.getByTitle('English');
    expect(englishButton).toHaveAttribute('aria-current', 'true');
  });

  it('calls onLanguageChange when language is selected', () => {
    render(<LanguageSwitcher currentLanguage="pa" onLanguageChange={mockOnLanguageChange} />);
    
    // Click on English button
    const englishButton = screen.getByTitle('English');
    fireEvent.click(englishButton);
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
  });
});
