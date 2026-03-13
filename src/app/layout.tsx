import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App } from "antd";
import viVN from "antd/locale/vi_VN";
import "./globals.css";

export const metadata: Metadata = {
  title: "GE Customer Management",
  description: "Hệ thống quản lý khách hàng cửa hàng mắt kính",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AntdRegistry>
          <ConfigProvider
            locale={viVN}
            theme={{
              token: {
                colorPrimary: "#2563eb",
                colorSuccess: "#16a34a",
                colorWarning: "#d97706",
                colorError: "#dc2626",
                colorInfo: "#0891b2",
                borderRadius: 12,
                fontSize: 16,
                fontSizeHeading1: 38,
                fontSizeHeading2: 30,
                fontSizeHeading3: 24,
                fontSizeHeading4: 20,
                fontSizeHeading5: 18,
                fontSizeLG: 18,
                controlHeight: 44,
                controlHeightLG: 52,
                controlHeightSM: 36,
                lineWidth: 2,
                padding: 20,
                paddingLG: 28,
                paddingSM: 16,
                margin: 20,
                marginLG: 28,
                marginSM: 16,
              },
              components: {
                Button: {
                  fontWeight: 600,
                  paddingInline: 24,
                },
                Table: {
                  headerBg: "#f0f9ff",
                  headerColor: "#1e40af",
                  rowHoverBg: "#eff6ff",
                  cellPaddingBlock: 16,
                  cellPaddingInline: 16,
                  fontSize: 16,
                },
                Card: {
                  headerFontSize: 20,
                  fontSize: 16,
                },
                Menu: {
                  fontSize: 16,
                  itemHeight: 52,
                  iconSize: 20,
                },
                Form: {
                  labelFontSize: 16,
                  verticalLabelPadding: "0 0 12px",
                },
                Input: {
                  paddingBlock: 12,
                  paddingInline: 16,
                },
                Select: {
                  optionFontSize: 16,
                },
                Tabs: {
                  titleFontSize: 18,
                },
                Tag: {
                  fontSize: 15,
                },
                Statistic: {
                  titleFontSize: 16,
                  contentFontSize: 32,
                },
              },
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
