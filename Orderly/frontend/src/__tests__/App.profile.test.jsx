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

jest.mock("../pages/Auth/Register", () => function MockRegister() {
  return <div>Register Page</div>;
});

jest.mock("../pages/Auth/Login", () => function MockLogin() {
  return <div>Login Page</div>;
});

jest.mock("../pages/Auth/ResetPasswordRequest", () => function MockResetPasswordRequest() {
  return <div>Reset Password Request Page</div>;
});

jest.mock("../pages/Auth/ResetPassword", () => function MockResetPassword() {
  return <div>Reset Password Page</div>;
});

jest.mock("../pages/Auth/Profile", () => function MockProfile() {
  return <div>Profile Page</div>;
});

describe("App Profile Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows Your Account link when user is authenticated", () => {
    auth.isAuthenticated.mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("link", { name: /your account/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /logout/i })
    ).toBeInTheDocument();
  });

  test("does not show Your Account link when user is not authenticated", () => {
    auth.isAuthenticated.mockReturnValue(false);

    render(<App />);

    expect(
      screen.queryByRole("link", { name: /your account/i })
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });
});