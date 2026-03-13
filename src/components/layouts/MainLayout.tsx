"use client";

import React, { useState } from "react";
import { Layout, Menu, theme, Avatar, Dropdown, Button } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BarChartOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems: MenuProps["items"] = [
  {
    key: "/dashboard",
    icon: <TeamOutlined />,
    label: "Quản lý khách hàng",
  },
  {
    key: "/prescriptions",
    icon: <MedicineBoxOutlined />,
    label: "Đơn thuốc",
  },
  {
    key: "/reports",
    icon: <BarChartOutlined />,
    label: "Báo cáo & Thống kê",
  },
];

const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: "Thông tin cá nhân",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Cài đặt",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Đăng xuất",
    danger: true,
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false); // Start open
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  const handleUserMenuClick: MenuProps["onClick"] = async (e) => {
    if (e.key === "logout") {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
      } catch {
        router.push("/login");
      }
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={80}
        className="!bg-white shadow-md"
        theme="light"
      >
        <div className="h-16 flex items-center justify-center border-b">
          <h1
            className={`font-bold text-primary transition-all ${collapsed ? "text-lg" : "text-xl"}`}
          >
            {collapsed ? "GE" : "GE Optical"}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 mt-2 font-medium"
          style={{
            fontSize: "15px",
            fontWeight: 500,
          }}
        />
      </Sider>
      <Layout>
        <Header
          className="flex items-center justify-between px-6 shadow-sm"
          style={{ background: colorBgContainer }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors">
              <Avatar icon={<UserOutlined />} />
              <span className="hidden sm:inline">Admin</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          className="m-4 p-6 overflow-auto"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
