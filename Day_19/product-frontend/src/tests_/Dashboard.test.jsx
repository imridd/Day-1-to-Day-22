import { describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent
} from "@testing-library/react";
import Dashboard from "../components/Dashboard";
// TEST DATA
const mockProducts = [
  {id: 1,sku: "LAP-001",name: "Laptop",price: 55000,stock: 10},
  {id: 2,sku: "MOU-001",name: "Wireless Mouse",price: 799,stock: 3},
  {id: 3,sku: "KEY-001",
    name: "Keyboard",
    price: 1599,
    stock: 0
  },
  {
    id: 4,
    sku: "DES-001",
    name: "Desktop",
    price: 25000,
    stock: 5
  }
];
describe("Dashboard Component", () => {
  // TEST 1: RENDER DASHBOARD
  it("should render the dashboard heading", () => {
    render(<Dashboard products={mockProducts} />);
    expect(
      screen.getByText("Dashboard Overview")
    ).toBeInTheDocument();
  });
  // TEST 2: TOTAL PRODUCTS
  it("should display the total number of products", () => {
    render(<Dashboard products={mockProducts} />);
    expect(
      screen.getByText("4")
    ).toBeInTheDocument();
  });
  // TEST 3: TOTAL STOCK
  it("should calculate total stock units correctly", () => {
    render(<Dashboard products={mockProducts} />);
    expect(
      screen.getByText("18")
    ).toBeInTheDocument();
  });
  // TEST 4: INVENTORY VALUE
  it("should calculate total inventory value correctly", () => {
    render(<Dashboard products={mockProducts} />);
    // (55000 * 10) + (799 * 3) + (1599 * 0) + (25000 * 5)
    // Expected total = 677397
    expect(
      screen.getByText("6,77,397", { exact: false })
    ).toBeInTheDocument();
  });
  // TEST 5: LOW STOCK PRODUCTS
  it("should display the correct low stock count", () => {
    render(<Dashboard products={mockProducts} />);
    expect(
      screen.getByText("Low Stock Products")
    ).toBeInTheDocument();
    // Mouse and Desktop have stock between 1 and 5.
    expect(
      screen.getByText("2", { selector: "p" })
    ).toBeInTheDocument();
  });
  // TEST 6: OUT OF STOCK PRODUCTS
  it("should display the correct out of stock count", () => {
    render(<Dashboard products={mockProducts} />);
    // Appears once in the alert heading and once in the product chip.
    expect(
      screen.getAllByText("Out of Stock")
    ).toHaveLength(2);
    // One product has zero stock.
    expect(
      screen.getByText("1", { selector: "p" })
    ).toBeInTheDocument();
  });
  // TEST 7: RECENT PRODUCTS
  it("should display recent products in descending ID order", () => {
    render(<Dashboard products={mockProducts} />);
    const productNames = screen.getAllByText(
      /Laptop|Wireless Mouse|Keyboard|Desktop/
    );
    expect(productNames[0]).toHaveTextContent("Desktop");
    expect(productNames[1]).toHaveTextContent("Keyboard");
    expect(productNames[2]).toHaveTextContent("Wireless Mouse");
    expect(productNames[3]).toHaveTextContent("Laptop");
  });
  // TEST 8: PRODUCT STOCK STATUS
  it("should display the correct stock status for products", () => {
    render(<Dashboard products={mockProducts} />);
    expect(
      screen.getByText("In Stock")
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Low Stock")
    ).toHaveLength(2);
    expect(
      screen.getAllByText("Out of Stock")
    ).toHaveLength(2);
  });
  // TEST 9: EMPTY PRODUCT LIST
  it("should display an empty state when no products exist", () => {
    render(<Dashboard products={[]} />);
    expect(
      screen.getByText("No products available")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add products to see them here.")
    ).toBeInTheDocument();
  });
  // TEST 10: NAVIGATION BUTTON
  it("should call onNavigate when View Products is clicked", () => {
    const mockNavigate = vi.fn();
    render(
      <Dashboard
        products={mockProducts}
        onNavigate={mockNavigate}
      />
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /View Products/i
      })
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  // TEST 11: VIEW ALL BUTTON
  it("should call onNavigate when View All is clicked", () => {
    const mockNavigate = vi.fn();
    render(
      <Dashboard
        products={mockProducts}
        onNavigate={mockNavigate}
      />
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /View All/i
      })
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
  // TEST 12: DEFAULT PROPS
  it("should render without errors when products are not provided", () => {
    render(<Dashboard />);
    expect(
      screen.getByText("Dashboard Overview")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No products available")
    ).toBeInTheDocument();
  });
});
