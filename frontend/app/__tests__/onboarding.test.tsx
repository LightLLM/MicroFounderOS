import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OnboardingPage from '../onboarding/page';
import * as api from '@/lib/api';

jest.mock('next/navigation');
jest.mock('@/lib/api');

describe('OnboardingPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render email input step', () => {
    render(<OnboardingPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/send magic link/i)).toBeInTheDocument();
  });

  it('should send magic link on button click', async () => {
    (api.sendMagicLink as jest.Mock).mockResolvedValue({ success: true });

    render(<OnboardingPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const sendButton = screen.getByText(/send magic link/i);
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(api.sendMagicLink).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show business type selection after email verification', () => {
    render(<OnboardingPage />);
    
    // Simulate email verification
    const continueButton = screen.getByText(/continue/i);
    fireEvent.click(continueButton);

    expect(screen.getByText(/what type of business/i)).toBeInTheDocument();
  });

  it('should show questions after business type selection', () => {
    render(<OnboardingPage />);
    
    // Go through steps
    const continueButton = screen.getByText(/continue/i);
    fireEvent.click(continueButton);
    
    const saasButton = screen.getByText('SaaS');
    fireEvent.click(saasButton);

    expect(screen.getByText(/tell us about your business/i)).toBeInTheDocument();
  });

  it('should complete onboarding when all questions answered', async () => {
    (api.completeOnboarding as jest.Mock).mockResolvedValue({ success: true, businessId: 'business-123' });

    render(<OnboardingPage />);
    
    // Navigate through steps
    const continueButton = screen.getByText(/continue/i);
    fireEvent.click(continueButton);
    
    const saasButton = screen.getByText('SaaS');
    fireEvent.click(saasButton);

    // Answer questions
    const inputs = screen.getAllByPlaceholderText(/your answer/i);
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: `Answer ${index + 1}` } });
    });

    const completeButton = screen.getByText(/complete onboarding/i);
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(api.completeOnboarding).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});

