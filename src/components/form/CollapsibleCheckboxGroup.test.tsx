import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CollapsibleCheckboxGroup } from './CollapsibleCheckboxGroup';
import type { CheckboxOption } from './CollapsibleCheckboxGroup';

describe('CollapsibleCheckboxGroup', () => {
  const mockOptions: CheckboxOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    title: 'Test Group',
    options: mockOptions,
    selectedValues: [],
    onChange: vi.fn(),
  };

  it('should render with title', () => {
    render(<CollapsibleCheckboxGroup {...defaultProps} />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
  });

  it('should be expanded by default when defaultCollapsed is false', () => {
    render(<CollapsibleCheckboxGroup {...defaultProps} defaultCollapsed={false} />);
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('should be collapsed by default when defaultCollapsed is true', () => {
    const { container } = render(<CollapsibleCheckboxGroup {...defaultProps} defaultCollapsed={true} />);
    const collapseDiv = container.querySelector('.MuiCollapse-hidden');
    expect(collapseDiv).toBeInTheDocument();
  });

  it('should toggle collapse state when clicking expand button', () => {
    render(<CollapsibleCheckboxGroup {...defaultProps} defaultCollapsed={true} />);
    
    const expandButton = screen.getAllByRole('button')[0]; // First button is the expand/collapse button
    fireEvent.click(expandButton);
    
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('should show summary when collapsed', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        selectedValues={['option1', 'option2']}
        defaultCollapsed={true}
      />
    );
    
    expect(screen.getByText('Option 1、Option 2')).toBeInTheDocument();
  });

  it('should show "全て選択中" when all options are selected', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        selectedValues={['option1', 'option2', 'option3']}
        defaultCollapsed={true}
      />
    );
    
    expect(screen.getByText('全て選択中')).toBeInTheDocument();
  });

  it('should show "未選択" when no options are selected', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        selectedValues={[]}
        defaultCollapsed={true}
      />
    );
    
    expect(screen.getByText('未選択')).toBeInTheDocument();
  });

  it('should call onChange when checkbox is clicked', () => {
    const onChange = vi.fn();
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        onChange={onChange}
        selectedValues={['option1']}
      />
    );
    
    const checkbox2 = screen.getByLabelText('Option 2');
    fireEvent.click(checkbox2);
    
    expect(onChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('should call onChange with empty array when deselect all is clicked', () => {
    const onChange = vi.fn();
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        onChange={onChange}
        selectedValues={['option1', 'option2']}
      />
    );
    
    const deselectAllButton = screen.getByRole('button', { name: '全て解除' });
    fireEvent.click(deselectAllButton);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should call onChange with all values when select all is clicked', () => {
    const onChange = vi.fn();
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        onChange={onChange}
        selectedValues={['option1']}
      />
    );
    
    const selectAllButton = screen.getByRole('button', { name: '全て選択' });
    fireEvent.click(selectAllButton);
    
    expect(onChange).toHaveBeenCalledWith(['option1', 'option2', 'option3']);
  });

  it('should display error message when provided', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        error="This is an error message"
      />
    );
    
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
  });

  it('should disable select all button when all are selected', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        selectedValues={['option1', 'option2', 'option3']}
      />
    );
    
    const selectAllButton = screen.getByRole('button', { name: '全て選択' });
    expect(selectAllButton).toBeDisabled();
  });

  it('should disable deselect all button when none are selected', () => {
    render(
      <CollapsibleCheckboxGroup
        {...defaultProps}
        selectedValues={[]}
      />
    );
    
    const deselectAllButton = screen.getByRole('button', { name: '全て解除' });
    expect(deselectAllButton).toBeDisabled();
  });
});