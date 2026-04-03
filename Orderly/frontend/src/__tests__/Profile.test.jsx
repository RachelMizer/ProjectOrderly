import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../pages/Auth/Profile";
import * as auth from "../api/auth";

jest.mock("../api/auth");

describe("Profile Page", () => {
  const mockProfile = {
    firstName: "Kenneth",
    lastName: "Bacdayan",
    email: "kenny@test.com",
    streetAddress: "123 Main St",
    city: "Raleigh",
    state: "NC",
    zipcode: "27601",
    phone: "9195551234",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders loading state", () => {
    auth.getProfile.mockImplementation(() => new Promise(() => {}));

    render(<Profile />);
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  test("loads and displays profile data", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    // FIX: heading is "Profile"
    expect(await screen.findByRole("heading", { name: /profile/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Kenneth");
    expect(screen.getByLabelText(/email/i)).toHaveValue("kenny@test.com");
  });

  test("email is disabled", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    const email = await screen.findByLabelText(/email/i);
    expect(email).toBeDisabled();
  });

  test("allows editing fields", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    const firstName = await screen.findByLabelText(/first name/i);

    fireEvent.change(firstName, { target: { value: "Ken" } });

    expect(firstName).toHaveValue("Ken");
  });

  test("submits updated profile", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    const firstName = await screen.findByLabelText(/first name/i);

    fireEvent.change(firstName, { target: { value: "Ken" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(auth.updateProfile).toHaveBeenCalled();
    });
  });

  test("shows success message", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  test("shows error when load fails", async () => {
    auth.getProfile.mockRejectedValue(new Error("Failed to load profile"));

    render(<Profile />);

    expect(
      await screen.findByText(/failed to load profile/i)
    ).toBeInTheDocument();
  });
});