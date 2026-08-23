import { render, screen } from "@testing-library/react";
import { HomeView } from "@/components/HomeView";

describe("Home page", () => {
  it("renders without crashing", () => {
    render(<HomeView data={[]} error={null} />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
