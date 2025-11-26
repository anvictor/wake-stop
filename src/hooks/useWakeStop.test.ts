// useWakeStop.test.ts
import { renderHook, act } from "@testing-library/react";
import { useWakeStop } from "./useWakeStop";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/utils/distanceCalculator", () => ({
  calculateDistance: vi.fn(),
  estimateTime: vi.fn(),
}));

vi.mock("@/utils/alarmSound", () => ({
  playAlarmSound: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useWakeStop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useWakeStop());

    expect(result.current.currentLocation).toBeNull();
    expect(result.current.destination).toBeNull();
    expect(result.current.isTracking).toBe(false);
    expect(result.current.alertTime).toBe(10);
  });

  it("should update location", () => {
    const { result } = renderHook(() => useWakeStop());

    const mockPosition = {
      coords: {
        latitude: 10,
        longitude: 20,
      },
    } as GeolocationPosition;

    act(() => {
      result.current.handleLocationUpdate(mockPosition);
    });

    expect(result.current.currentLocation).toEqual({ lat: 10, lng: 20 });
  });

  it("should set destination", () => {
    const { result } = renderHook(() => useWakeStop());

    act(() => {
      result.current.handleDestinationSet(30, 40, "Test Place");
    });

    expect(result.current.destination).toEqual({
      lat: 30,
      lng: 40,
      name: "Test Place",
    });
  });

  it("should start tracking when alarm is set", () => {
    const { result } = renderHook(() => useWakeStop());

    // Setup prerequisites
    const mockPosition = {
      coords: { latitude: 10, longitude: 20 },
    } as GeolocationPosition;

    act(() => {
      result.current.handleLocationUpdate(mockPosition);
      result.current.handleDestinationSet(30, 40, "Test Place");
    });

    act(() => {
      result.current.handleAlarmSet(15);
    });

    expect(result.current.isTracking).toBe(true);
    expect(result.current.alertTime).toBe(15);
  });
});
