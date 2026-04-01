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

  test("renders loading state before profile data loads", () => {
    auth.getProfile.mockImplementation(
      () =>
        new Promise(() => {
          // intentionally unresolved
        })
    );

    render(<Profile />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  test("loads and displays profile data on page load", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    expect(await screen.findByRole("heading", { name: /my profile/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Kenneth");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Bacdayan");
    expect(screen.getByLabelText(/email/i)).toHaveValue("kenny@test.com");
    expect(screen.getByLabelText(/street address/i)).toHaveValue("123 Main St");
    expect(screen.getByLabelText(/^city$/i)).toHaveValue("Raleigh");
    expect(screen.getByLabelText(/^state$/i)).toHaveValue("NC");
    expect(screen.getByLabelText(/zip code/i)).toHaveValue("27601");
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("9195551234");
  });

  test("email field is displayed but disabled", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    const emailInput = await screen.findByLabelText(/email/i);
    expect(emailInput).toBeDisabled();
  });

  test("allows user to edit fields except email", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    const firstNameInput = await screen.findByLabelText(/first name/i);
    const cityInput = screen.getByLabelText(/^city$/i);

    fireEvent.change(firstNameInput, { target: { value: "Ken" } });
    fireEvent.change(cityInput, { target: { value: "Charlotte" } });

    expect(firstNameInput).toHaveValue("Ken");
    expect(cityInput).toHaveValue("Charlotte");
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
  });

  test("calls updateProfile with edited form data on save", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue({
      ...mockProfile,
      firstName: "Ken",
      city: "Charlotte",
    });

    render(<Profile />);

    const firstNameInput = await screen.findByLabelText(/first name/i);
    const cityInput = screen.getByLabelText(/^city$/i);

    fireEvent.change(firstNameInput, { target: { value: "Ken" } });
    fireEvent.change(cityInput, { target: { value: "Charlotte" } });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(auth.updateProfile).toHaveBeenCalledWith({
        firstName: "Ken",
        lastName: "Bacdayan",
        email: "kenny@test.com",
        streetAddress: "123 Main St",
        city: "Charlotte",
        state: "NC",
        zipcode: "27601",
        phone: "9195551234",
      });
    });
  });

  test("shows success message after successful profile update", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue({
      ...mockProfile,
      firstName: "Ken",
    });

    render(<Profile />);

    const firstNameInput = await screen.findByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "Ken" } });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  test("clears success message automatically after 3 seconds", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue(mockProfile);

    render(<Profile />);

    await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(
        screen.queryByText(/profile updated successfully/i)
      ).not.toBeInTheDocument();
    });
  });

  test("disables form while submitting", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    let resolveUpdate;
    auth.updateProfile.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        })
    );

    render(<Profile />);

    await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(screen.getByLabelText(/first name/i)).toBeDisabled();
    expect(screen.getByLabelText(/last name/i)).toBeDisabled();
    expect(screen.getByLabelText(/street address/i)).toBeDisabled();

    resolveUpdate(mockProfile);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^save$/i })).not.toBeDisabled();
    });
  });

  test("shows error when profile load fails", async () => {
    auth.getProfile.mockRejectedValue(new Error("Failed to load profile"));

    render(<Profile />);

    expect(
      await screen.findByText(/failed to load profile/i)
    ).toBeInTheDocument();
  });

  test("shows backend detail message when profile load fails", async () => {
    auth.getProfile.mockRejectedValue({
      response: {
        data: {
          detail: "Unauthorized",
        },
      },
      message: "Failed to load profile",
    });

    render(<Profile />);

    expect(await screen.findByText(/unauthorized/i)).toBeInTheDocument();
  });

  test("shows backend field error message when update fails with fields object", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockRejectedValue({
      response: {
        data: {
          fields: {
            firstName: ["This field is required."],
          },
        },
      },
    });

    render(<Profile />);

    await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/first name: this field is required\./i)
    ).toBeInTheDocument();
  });

  test("shows nested customer_profile field error when update fails", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockRejectedValue({
      response: {
        data: {
          customer_profile: {
            street_address: ["Street address is invalid."],
          },
        },
      },
    });

    render(<Profile />);

    await screen.findByLabelText(/street address/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/street address: street address is invalid\./i)
    ).toBeInTheDocument();
  });

  test("shows backend message when update fails without field-level errors", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockRejectedValue({
      response: {
        data: {
          message: "Update failed",
        },
      },
      message: "Failed to update profile",
    });

    render(<Profile />);

    await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });

  test("clears old error and success messages when user edits a field", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockRejectedValue({
      response: {
        data: {
          message: "Update failed",
        },
      },
    });

    render(<Profile />);

    const firstNameInput = await screen.findByLabelText(/first name/i);

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: "Ken" } });

    expect(screen.queryByText(/update failed/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/profile updated successfully/i)
    ).not.toBeInTheDocument();
  });
});