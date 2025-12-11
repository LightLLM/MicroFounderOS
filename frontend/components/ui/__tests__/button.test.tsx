import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should apply outline variant', () => {
    render(<Button variant="outline">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('should apply size classes', () => {
    render(<Button size="lg">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

