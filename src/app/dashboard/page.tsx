"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Button,
  Form,
  DatePicker,
  Select,
  Typography,
  App,
  Card,
  Avatar,
  Row,
  Col,
  Modal,
  Table,
  Tag,
  Tooltip,
  Space,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  EyeOutlined,
  TeamOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClearOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import type { ColumnsType } from "antd/es/table";
import type { TableProps } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

interface Customer {
  id: number;
  fullname: string;
  dateofbirth: string;
  phone_number: string;
  address?: string;
  gender?: number;
  prescription_count?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({ customers: 0, prescriptions: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  // Filter states
  const [filterMinPrescriptions, setFilterMinPrescriptions] =
    useState<string>("");
  const [filterGender, setFilterGender] = useState<string>("");
  const [filterHasFamily, setFilterHasFamily] = useState<string>("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchName && { fullname: searchName }),
        ...(searchPhone && { phone: searchPhone }),
        ...(filterMinPrescriptions && {
          minPrescriptions: filterMinPrescriptions,
        }),
        ...(filterGender && { gender: filterGender }),
        ...(filterHasFamily && { hasFamily: filterHasFamily }),
      });
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.items);
        setTotal(data.data.total);
      }
    } catch {
      message.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    searchName,
    searchPhone,
    filterMinPrescriptions,
    filterGender,
    filterHasFamily,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.status === "ok") {
        setStats(data.data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchPhone("");
    setFilterMinPrescriptions("");
    setFilterGender("");
    setFilterHasFamily("");
    setPage(1);
  };

  const handleTableChange: TableProps<Customer>["onChange"] = (
    pagination,
    _filters,
    sorter,
  ) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    if (!Array.isArray(sorter) && sorter.field) {
      setSortField(sorter.field as string);
      setSortOrder(
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
            ? "desc"
            : "",
      );
    } else {
      setSortField("");
      setSortOrder("");
    }
  };

  const handleCreateCustomer = async (values: Record<string, unknown>) => {
    setCreating(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: values.fullname,
          dateofbirth: (values.dateofbirth as dayjs.Dayjs).format("YYYY-MM-DD"),
          phone_number: values.phone_number,
          address: values.address,
          gender: values.gender,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("Tạo khách hàng thành công!");
        setShowCreateModal(false);
        fetchCustomers();
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setCreating(false);
    }
  };

  // Sorted data
  const sortedCustomers = React.useMemo(() => {
    if (!sortField || !sortOrder) return customers;
    return [...customers].sort((a, b) => {
      const aVal = a[sortField as keyof Customer] || "";
      const bVal = b[sortField as keyof Customer] || "";
      if (sortOrder === "asc") {
        return String(aVal).localeCompare(String(bVal));
      }
      return String(bVal).localeCompare(String(aVal));
    });
  }, [customers, sortField, sortOrder]);

  // Table Columns - Clean & Simple
  const columns: ColumnsType<Customer> = [
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      sorter: true,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={44}
            icon={record.gender === 1 ? <WomanOutlined /> : <ManOutlined />}
            className={record.gender === 1 ? "bg-pink-500" : "bg-blue-500"}
          />
          <div>
            <Text strong className="block">
              {name}
            </Text>
            <Tag
              color={record.gender === 1 ? "magenta" : "blue"}
              className="text-xs"
            >
              {record.gender === 1 ? "Nữ" : "Nam"}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 150,
      sorter: true,
      render: (phone) => (
        <Text copyable className="font-mono">
          {phone}
        </Text>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateofbirth",
      key: "dateofbirth",
      width: 130,
      sorter: true,
      render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
    },
    {
      title: "Số đơn",
      dataIndex: "prescription_count",
      key: "prescription_count",
      width: 90,
      align: "center",
      sorter: true,
      render: (count) => (
        <Tag color={count > 0 ? "blue" : "default"} className="font-semibold">
          {count || 0}
        </Tag>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address) =>
        address ? (
          <Tooltip title={address}>
            <Text>{address}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary" italic>
            —
          </Text>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/customers/${record.id}`)}
          >
            Chi tiết
          </Button>
          <Tooltip title="Tạo đơn thuốc">
            <Button
              icon={<FileTextOutlined />}
              onClick={() =>
                router.push(`/customers/${record.id}/prescriptions/new`)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <Title level={2} className="!mb-1 !text-gray-800">
              👓 Quản lý Khách hàng
            </Title>
            <Text className="text-gray-500 text-base">
              Tìm kiếm và quản lý thông tin khách hàng của cửa hàng
            </Text>
          </div>
          {mounted && (
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-6 py-4 text-white shadow-lg shadow-blue-200">
                <div className="text-3xl font-bold">
                  {stats.customers.toLocaleString()}
                </div>
                <div className="text-blue-100 text-sm">Khách hàng</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-6 py-4 text-white shadow-lg shadow-emerald-200">
                <div className="text-3xl font-bold">
                  {stats.prescriptions.toLocaleString()}
                </div>
                <div className="text-emerald-100 text-sm">Đơn thuốc</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 space-y-4">
        {/* Row 1: Tìm kiếm */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="Tìm theo tên khách hàng..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            size="large"
            style={{ width: 320 }}
          />
          <Input
            placeholder="Số điện thoại..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<PhoneOutlined className="text-gray-400" />}
            allowClear
            size="large"
            style={{ width: 220 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            size="large"
          >
            Tìm kiếm
          </Button>
        </div>

        {/* Row 2: Bộ lọc & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm font-medium">Bộ lọc:</span>
            <Select
              placeholder="Số đơn thuốc"
              value={filterMinPrescriptions || undefined}
              onChange={(value) => {
                setFilterMinPrescriptions(value || "");
                setPage(1);
              }}
              allowClear
              style={{ width: 150 }}
              className="h-10"
              options={[
                { label: "≥ 1 đơn", value: "1" },
                { label: "≥ 2 đơn", value: "2" },
                { label: "≥ 3 đơn", value: "3" },
                { label: "≥ 5 đơn", value: "5" },
                { label: "≥ 10 đơn", value: "10" },
              ]}
            />
            <Select
              placeholder="Giới tính"
              value={filterGender || undefined}
              onChange={(value) => {
                setFilterGender(value || "");
                setPage(1);
              }}
              allowClear
              style={{ width: 130 }}
              className="h-10"
              options={[
                { label: "Nam", value: "0" },
                { label: "Nữ", value: "1" },
              ]}
            />
            <Select
              placeholder="Gia đình"
              value={filterHasFamily || undefined}
              onChange={(value) => {
                setFilterHasFamily(value || "");
                setPage(1);
              }}
              allowClear
              style={{ width: 150 }}
              className="h-10"
              options={[
                { label: "Có gia đình", value: "true" },
                { label: "Không có", value: "false" },
              ]}
            />
            {(searchName ||
              searchPhone ||
              filterMinPrescriptions ||
              filterGender ||
              filterHasFamily) && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearSearch}
                danger
                className="h-10"
              >
                Xóa lọc
              </Button>
            )}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCustomers}
              loading={loading}
              className="h-10"
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              className="shadow-md shadow-blue-200 h-10"
            >
              Thêm khách hàng
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={sortedCustomers}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t, range) =>
              `Hiển thị ${range[0]}-${range[1]} trong tổng số ${t} khách hàng`,
            pageSizeOptions: ["10", "20", "50", "100"],
            showQuickJumper: true,
            className: "px-4 py-3",
          }}
          onRow={(record) => ({
            onDoubleClick: () => router.push(`/customers/${record.id}`),
            className: "cursor-pointer transition-colors duration-150",
          })}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <TeamOutlined className="text-4xl text-gray-400" />
                </div>
                <Title level={4} className="!text-gray-600 !mb-2">
                  Không tìm thấy khách hàng
                </Title>
                <Text className="text-gray-400 block mb-4">
                  Thử tìm kiếm với từ khóa khác hoặc thêm khách hàng mới
                </Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowCreateModal(true)}
                  size="large"
                  className="shadow-md shadow-blue-200"
                >
                  Thêm khách hàng mới
                </Button>
              </div>
            ),
          }}
        />
      </div>

      {/* Create Customer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200">
              <UserOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                Thêm khách hàng mới
              </div>
              <div className="text-sm font-normal text-gray-400">
                Điền thông tin khách hàng
              </div>
            </div>
          </div>
        }
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={600}
        destroyOnHidden
        centered
        className="rounded-2xl"
      >
        <Form
          layout="vertical"
          onFinish={handleCreateCustomer}
          size="large"
          className="mt-6"
        >
          <Form.Item
            name="fullname"
            label={<span className="text-base font-medium">Họ và tên</span>}
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dateofbirth"
                label={<span className="text-base font-medium">Ngày sinh</span>}
                rules={[{ required: true, message: "Vui lòng chọn" }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  className="w-full"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label={<span className="text-base font-medium">Giới tính</span>}
              >
                <Select
                  placeholder="Chọn"
                  options={[
                    { value: 0, label: "Nam" },
                    { value: 1, label: "Nữ" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone_number"
                label={
                  <span className="text-base font-medium">Số điện thoại</span>
                }
                rules={[{ required: true, message: "Vui lòng nhập" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập SĐT" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label={<span className="text-base font-medium">Địa chỉ</span>}
          >
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ (không bắt buộc)"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <Button
              size="large"
              onClick={() => setShowCreateModal(false)}
              className="min-w-[100px]"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              icon={<PlusOutlined />}
              size="large"
              className="min-w-[140px] shadow-md shadow-blue-200"
            >
              Tạo khách hàng
            </Button>
          </div>
        </Form>
      </Modal>
    </MainLayout>
  );
}
