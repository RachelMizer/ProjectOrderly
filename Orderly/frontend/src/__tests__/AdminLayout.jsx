import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";

describe("AdminLayout", () => {
  test("renders layout and outlet content", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Outlet Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Outlet Content")).toBeInTheDocument();
  });
});