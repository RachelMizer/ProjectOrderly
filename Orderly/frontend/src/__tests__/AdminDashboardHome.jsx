import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboardHome from "../pages/Admin/AdminDashboardHome";

describe("AdminDashboardHome", () => {
  test("renders component without crashing", () => {
    render(
      <MemoryRouter>
        <AdminDashboardHome />
      </MemoryRouter>
    );

    // Just assert something that always exists
    expect(screen.getByText(/business users only/i)).toBeInTheDocument();
  });
});