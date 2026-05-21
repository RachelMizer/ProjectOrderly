import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";

// Mock Navigate so we can see redirects
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>,
  };
});

describe("ProtectedAdminRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("redirects to login if no user", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />

          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Redirected to \/login/)).toBeInTheDocument();
  });

  test("redirects to home if not STORE_MANAGER role", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ role: "CUSTOMER" })
    );

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />

          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Redirected to \//)).toBeInTheDocument();
  });

  test("renders outlet content if STORE_MANAGER role", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ role: "STORE_MANAGER" })
    );

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />

          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});