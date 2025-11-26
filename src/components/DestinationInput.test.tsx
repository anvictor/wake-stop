// DestinationInput.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DestinationInput } from "./DestinationInput";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch
global.fetch = vi.fn();

describe("DestinationInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render input field", () => {
    render(<DestinationInput onDestinationSet={vi.fn()} />);
    expect(screen.getByPlaceholderText("Enter destination...")).toBeInTheDocument();
  });

  it("should fetch suggestions on typing", async () => {
    const mockResponse = [
      {
        lat: "10",
        lon: "20",
        display_name: "Test Location",
      },
    ];

    (global.fetch as any).mockResolvedValue({
      json: async () => mockResponse,
    });

    render(<DestinationInput onDestinationSet={vi.fn()} />);

    const input = screen.getByPlaceholderText("Enter destination...");
    fireEvent.change(input, { target: { value: "Test" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 1000 });

    expect(await screen.findByText("Test Location")).toBeInTheDocument();
  });

  it("should call onDestinationSet when suggestion is clicked", async () => {
    const mockOnDestinationSet = vi.fn();
    const mockResponse = [
      {
        lat: "10",
        lon: "20",
        display_name: "Test Location",
      },
    ];

    (global.fetch as any).mockResolvedValue({
      json: async () => mockResponse,
    });

    render(<DestinationInput onDestinationSet={mockOnDestinationSet} />);

    const input = screen.getByPlaceholderText("Enter destination...");
    fireEvent.change(input, { target: { value: "Test" } });

    const suggestion = await screen.findByText("Test Location");
    fireEvent.click(suggestion);

    expect(mockOnDestinationSet).toHaveBeenCalledWith(10, 20, "Test Location");
  });
});
