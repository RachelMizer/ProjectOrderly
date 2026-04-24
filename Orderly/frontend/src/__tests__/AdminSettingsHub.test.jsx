import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSettingsHub from "../pages/Admin/AdminSettingsHub";

describe("AdminSettingsHub", () => {

test("renders settings management heading", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

expect(
screen.getByText(/settings management/i)
).toBeInTheDocument();
});


test("renders business settings link", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

const businessLink = screen.getByRole("link",{
name:/business settings/i
});

expect(businessLink).toBeInTheDocument();
expect(businessLink).toHaveAttribute(
"href",
"/admin/settings/business"
);
});


test("renders storefront settings link", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

const storefrontLink = screen.getByRole("link",{
name:/storefront settings/i
});

expect(storefrontLink).toBeInTheDocument();
expect(storefrontLink).toHaveAttribute(
"href",
"/admin/settings/storefront"
);
});


test("renders business settings description", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

expect(
screen.getByText(
/tax rate, business address, contact information/i
)
).toBeInTheDocument();
});


test("renders storefront settings description", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

expect(
screen.getByText(
/customer-facing details and configuration/i
)
).toBeInTheDocument();
});


test("renders two settings cards", () => {
render(
<MemoryRouter>
<AdminSettingsHub />
</MemoryRouter>
);

expect(
screen.getAllByRole("link")
).toHaveLength(2);
});

});