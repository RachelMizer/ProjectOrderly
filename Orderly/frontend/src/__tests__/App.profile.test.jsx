import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  requestPasswordReset: jest.fn(),
  confirmPasswordReset: jest.fn(),
}));

jest.mock("../pages/Register", () => function MockRegister() {
  return <div>Register Page</div>;
});

jest.mock("../pages/Login", () => function MockLogin() {
  return <div>Login Page</div>;
});

jest.mock("../pages/ResetPasswordRequest", () => function MockResetPasswordRequest() {
  return <div>Reset Password Request Page</div>;
});

jest.mock("../pages/ResetPassword", () => function MockResetPassword() {
  return <div>Reset Password Page</div>;
});

jest.mock("../pages/Profile", () => function MockProfile() {
  return <div>Profile Page</div>;
});

describe("App Profile Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows Profile link when user is authenticated", () => {
    auth.isAuthenticated.mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /logout/i })
    ).toBeInTheDocument();
  });

  test("does not show Profile link when user is not authenticated", () => {
    auth.isAuthenticated.mockReturnValue(false);

    render(<App />);

    expect(
      screen.queryByRole("link", { name: /profile/i })
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });
});