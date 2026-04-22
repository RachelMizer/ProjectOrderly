import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminNav from "../components/admin/AdminNav";

describe("AdminNav", () => {
  test("renders navigation links", () => {
    render(
      <MemoryRouter>
        <AdminNav />
      </MemoryRouter>
    );

    // ✅ Target exact nav items
    expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Suppliers")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
  });
});