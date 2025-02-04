import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "../index";
import { ColorModeContext } from "@/contexts/color-mode";
import { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";

beforeAll(() => {
  global.window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

jest.mock("@refinedev/core", () => ({
  useGetIdentity: jest.fn(() => ({
    data: { name: "John Doe", avatar: "avatar_url" },
  })),
}));

describe("Header Component", () => {
  const mockSetMode = jest.fn();
  const renderHeader = (props?: RefineThemedLayoutV2HeaderProps) => {
    return render(
      <ColorModeContext.Provider
        value={{ mode: "light", setMode: mockSetMode }}
      >
        <Header {...props} />
      </ColorModeContext.Provider>
    );
  };

  it("renders without crashing", () => {
    renderHeader();
    expect(screen.getByRole("banner")).toBeInTheDocument(); // AntdLayout.Header
  });

  it("renders user details when available", () => {
    (useGetIdentity as jest.Mock).mockReturnValue({
      data: { name: "John Doe", avatar: "avatar.jpg" },
    });

    renderHeader();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "John Doe" })).toBeInTheDocument();
  });

  it("does not render user details if no user data", () => {
    (useGetIdentity as jest.Mock).mockReturnValue({ data: null });

    renderHeader();

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("toggles dark mode on switch change", () => {
    renderHeader();

    const switchElement = screen.getByRole("switch");

    fireEvent.click(switchElement);

    expect(mockSetMode).toHaveBeenCalledWith("dark");
  });

  it("applies sticky styles when sticky prop is true", () => {
    const { container } = renderHeader({ sticky: true });

    expect(container.firstChild).toHaveStyle("position: sticky");
  });

  it("does not apply sticky styles when sticky prop is false", () => {
    const { container } = renderHeader({ sticky: false });

    expect(container.firstChild).not.toHaveStyle("position: sticky");
  });
});
