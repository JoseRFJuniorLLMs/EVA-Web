import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Search } from 'lucide-react';
import { CardShell } from '../CardShell';

describe('CardShell', () => {
  it('renders title and children', () => {
    render(
      <CardShell icon={Search} title="Test Title" color="blue">
        <p>Content here</p>
      </CardShell>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <CardShell icon={Search} title="With Badge" color="red" badge={<span data-testid="badge">3</span>}>
        <p>Body</p>
      </CardShell>
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies correct color scheme classes', () => {
    const { container } = render(
      <CardShell icon={Search} title="Green Card" color="green">
        <p>Body</p>
      </CardShell>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('border-green-100');
  });
});
