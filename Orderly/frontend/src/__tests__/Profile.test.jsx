import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Auth/Profile";
import * as auth from "../api/auth";

jest.mock("../api/auth");

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

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

    renderProfile();
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  test("loads and displays profile data", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    renderProfile();

    expect(
      await screen.findByRole("heading", { name: /your profile/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Kenneth");
    expect(screen.getByLabelText(/email/i)).toHaveValue("kenny@test.com");
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("919-555-1234");
  });

  test("email is disabled", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    renderProfile();

    const email = await screen.findByLabelText(/email/i);
    expect(email).toBeDisabled();
  });

  test("shows account submenu links", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    renderProfile();

    expect(await screen.findByText(/order history/i)).toBeInTheDocument();

    // check heading instead of ambiguous "Profile"
    expect(
      screen.getByRole("heading", { name: /your profile/i })
    ).toBeInTheDocument();
  });

  test("allows editing fields", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);

    renderProfile();

    const firstName = await screen.findByLabelText(/first name/i);
    fireEvent.change(firstName, { target: { value: "Ken" } });

    expect(firstName).toHaveValue("Ken");
  });

  test("submits updated profile", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue({
      ...mockProfile,
      firstName: "Ken",
    });

    renderProfile();

    const firstName = await screen.findByLabelText(/first name/i);
    fireEvent.change(firstName, { target: { value: "Ken" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(auth.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Ken",
        })
      );
    });
  });

  test("shows success message", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue(mockProfile);

    renderProfile();

    await screen.findByLabelText(/first name/i);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  test("shows error when load fails", async () => {
    auth.getProfile.mockRejectedValue(new Error("Failed to load profile"));

    renderProfile();

    expect(
      await screen.findByText(/failed to load profile/i)
    ).toBeInTheDocument();
  });

    test("clears existing success and error messages when a field changes", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockResolvedValue(mockProfile);

      renderProfile();

      const firstName = await screen.findByLabelText(/first name/i);

      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText(/profile updated successfully/i)
      ).toBeInTheDocument();

      fireEvent.change(firstName, { target: { value: "Kenny" } });

      expect(
        screen.queryByText(/profile updated successfully/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    });

    test("formats 11-digit phone numbers returned from load", async () => {
      auth.getProfile.mockResolvedValue({
        ...mockProfile,
        phone: "19195551234",
      });

      renderProfile();

      expect(await screen.findByLabelText(/phone number/i)).toHaveValue(
        "1-919-555-1234"
      );
    });

    test("leaves non-standard phone values unchanged when loading", async () => {
      auth.getProfile.mockResolvedValue({
        ...mockProfile,
        phone: "91955",
      });

      renderProfile();

      expect(await screen.findByLabelText(/phone number/i)).toHaveValue("91955");
    });

    test("shows backend message when profile load fails with response data", async () => {
      auth.getProfile.mockRejectedValue({
        response: {
          data: {
            message: "Backend load failed",
          },
        },
      });

      renderProfile();

      expect(await screen.findByText("Backend load failed")).toBeInTheDocument();
    });

    test("shows backend detail when profile load fails with detail only", async () => {
      auth.getProfile.mockRejectedValue({
        response: {
          data: {
            detail: "Profile service unavailable",
          },
        },
      });

      renderProfile();

      expect(
        await screen.findByText("Profile service unavailable")
      ).toBeInTheDocument();
    });

    test("disables the form while submitting", async () => {
      let resolveUpdate;
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          })
      );

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
      expect(screen.getByLabelText(/first name/i)).toBeDisabled();
      expect(screen.getByLabelText(/phone number/i)).toBeDisabled();

      resolveUpdate(mockProfile);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /^save$/i })
        ).toBeInTheDocument();
      });
    });

    test("clears the success message after 3 seconds", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockResolvedValue(mockProfile);

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

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

    test("formats phone returned from successful update", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockResolvedValue({
        ...mockProfile,
        phone: "19195551234",
      });

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/phone number/i)).toHaveValue(
          "1-919-555-1234"
        );
      });
    });

    test("shows first backend fields error from array values", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockRejectedValue({
        response: {
          data: {
            fields: {
              first_name: ["This field is required."],
            },
          },
        },
      });

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText("First Name: This field is required.")
      ).toBeInTheDocument();
    });

    test("shows nested customer_profile field errors", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockRejectedValue({
        response: {
          data: {
            customer_profile: {
              street_address: ["Address is invalid."],
            },
          },
        },
      });

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText("Street Address: Address is invalid.")
      ).toBeInTheDocument();
    });

    test("shows direct backend field errors when fields object is absent", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockRejectedValue({
        response: {
          data: {
            non_field_errors: ["Something went wrong."],
          },
        },
      });

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText("Error: Something went wrong.")
      ).toBeInTheDocument();
    });

    test("falls back to backend message when update fails without field errors", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockRejectedValue({
        response: {
          data: {
            message: "Unable to update profile",
          },
        },
      });

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(
        await screen.findByText("Unable to update profile")
      ).toBeInTheDocument();
    });

    test("falls back to thrown error message when update fails without backend data", async () => {
      auth.getProfile.mockResolvedValue(mockProfile);
      auth.updateProfile.mockRejectedValue(new Error("Network blew up"));

      renderProfile();

      await screen.findByLabelText(/first name/i);
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(await screen.findByText("Network blew up")).toBeInTheDocument();
    });
});